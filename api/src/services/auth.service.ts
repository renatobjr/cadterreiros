import mongoose from "mongoose";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiResponseType } from "../@types/responsesTypes";
import { EMailTypes } from "../enum/EmailTYpes.enum";
import { ERole, IUser, User } from "../schemas/User";
import mailUtils from "../utils/mail.utils";
import tokenUtils from "../utils/token.utils";
import bcrypt from "bcryptjs";

/**
 * O código OTP nunca vai em claro no token: guardamos apenas um HMAC. Sem isso,
 * o token exposto na URL poderia ser decodificado para revelar o código e
 * concluir a troca de senha sem acesso ao e-mail.
 */
const otpHash = (code: string): string =>
  createHmac("sha256", process.env.JWT_SECRET as string)
    .update(code)
    .digest("hex");

/** Escopo do token de curta duração emitido só depois do OTP verificado. */
const PASSWORD_RESET_SCOPE = "password-reset";

/** Mínimo de senha, igual ao validado no formulário. */
const MIN_PASSWORD_LENGTH = 8;

const otpMatches = (code: string, hash?: string): boolean => {
  if (!hash) return false;
  const expected = Buffer.from(otpHash(code), "hex");
  const received = Buffer.from(hash, "hex");
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
};

export const authService = {
  login: async (
    email: string,
    password: string,
    origin: string
  ): Promise<ApiResponseType<IUser | string>> => {
    try {
      let user = await User.findOne({ email, isEnabled: true });
      if (!user) {
        return {
          error: "Email ou senha inválida",
          status: false,
        };
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return {
          error: "Email ou senha inválida",
          status: false,
        };
      }

      if (origin === "web" && user.role !== ERole.ADMIN) {
        return {
          error: "Você não tem permissão de acesso",
          status: false,
        };
      }

      const generateToken = tokenUtils.generate({ id: user._id });
      await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
      return {
        data: {
          ...user.toJSON(),
          token: generateToken,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  /**
   * Gera o token de recuperação/primeiro acesso.
   *
   * Guarda contra enumeração de usuários: a resposta é sempre sucesso, com um
   * token de mesmo formato e validade, exista ou não o e-mail. Para e-mails
   * desconhecidos o token é descartável (nenhum usuário corresponde ao `id`)
   * e nenhum e-mail é enviado — quem consome a API não consegue distinguir
   * um cadastro existente de um inexistente.
   */
  generateUserToken: async (
    email: string,
    isForget: boolean
  ): Promise<ApiResponseType<string>> => {
    try {
      const user = await User.findOne({ email, isEnabled: true });
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = tokenUtils.generate(
        {
          id: user?._id ?? new mongoose.Types.ObjectId(),
          email,
          codeHash: otpHash(code),
        },
        {
          expiresIn: "15m",
        }
      );

      if (!user) {
        return {
          data: token,
          status: true,
        };
      }

      const html = await mailUtils.template({
        type: isForget ? EMailTypes.CHANGE_PASSWORD : EMailTypes.FIRST_ACCESS,
        data: {
          username: user.fullname ?? user.email,
          code: code,
        },
      });

      // Envio em segundo plano: falha de SMTP não pode derrubar a API nem
      // vazar para o cliente (a resposta é idêntica à de e-mail inexistente).
      void mailUtils
        .sendMail({
          to: user.email,
          subject: isForget ? "Recuperação de senha" : "Primeiro acesso",
          html: html,
        })
        .catch((error: any) => {
          console.error(
            "[✖] Falha ao enviar e-mail de acesso:",
            error?.message ?? error
          );
        });

      User.updateOne({ _id: user._id }, { token: token });

      return {
        data: token,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  verifyOTP: async (
    token: string,
    otp: string
  ): Promise<ApiResponseType<string | IUser>> => {
    try {
      const decodedToken: any = tokenUtils.verify(token);

      if (!decodedToken) {
        return {
          error: "Token inválido",
          status: false,
        };
      }

      if (!otpMatches(otp, decodedToken.codeHash)) {
        return {
          error: "Código inválido",
          status: false,
        };
      }
      const user = await User.findById(decodedToken.id);
      if (!user) {
        return {
          error: "Não foi possível validar o token",
          status: false,
        };
      }

      // O token de recuperação (que viaja na URL) não serve para trocar a
      // senha: emitimos um token novo, de curta duração e escopo restrito.
      const resetToken = tokenUtils.generate(
        { id: user._id, scope: PASSWORD_RESET_SCOPE },
        { expiresIn: "10m" }
      );

      return {
        data: {
          ...user.toJSON(),
          token: resetToken,
        },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  validateToken: async (
    token: string
  ): Promise<ApiResponseType<string | IUser>> => {
    try {
      const decodedToken = tokenUtils.verify(token);

      if (!decodedToken) {
        return {
          error: "Invalid token",
          status: false,
        };
      }

      const user = await User.findById(decodedToken.id);
      if (!user) {
        return {
          error: "User not found",
          status: false,
        };
      }

      return {
        data: user,
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },

  setPassword: async (token: string, password: string, fullname: string) => {
    try {
      const decodedToken: any = tokenUtils.verify(token);

      // Só o token emitido por `verifyOTP` troca a senha — o token de
      // recuperação exposto na URL não é suficiente (evita troca sem OTP).
      if (!decodedToken || decodedToken.scope !== PASSWORD_RESET_SCOPE) {
        return {
          error: "Aconteceu um erro ao atualizar a senha",
          status: false,
        };
      }

      if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
        return {
          error: `A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
          status: false,
        };
      }

      const user = await User.findById(decodedToken.id);
      if (!user) {
        return {
          error: "Aconteceu um erro ao atualizar a senha",
          status: false,
        };
      }

      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(password, salt);

      user.password = hash;
      user.token = undefined;

      const updateUserData: Record<string, any> = {
        password: hash,
        token: undefined,
        isFirstLogin: false,
      };

      if (fullname) {
        updateUserData.fullname = fullname;
      }

      await User.updateOne({ _id: user._id }, updateUserData);

      // Nunca devolve o documento do usuário (contém o hash da senha).
      return {
        data: { id: String(user._id) },
        status: true,
      };
    } catch (error: any) {
      return {
        error: error,
        status: false,
      };
    }
  },
};
