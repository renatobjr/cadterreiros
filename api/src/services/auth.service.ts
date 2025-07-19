import mongoose from "mongoose";
import { ApiResponseType } from "../@types/responsesTypes";
import { EMailTYpes } from "../enum/EmailTYpes.enum";
import { ERole, IUser, User } from "../schemas/User";
import mailUtils from "../utils/mail.utils";
import tokenUtils from "../utils/token.utils";
import bcrypt from "bcryptjs";

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

  forgetPassword: async (email: string): Promise<ApiResponseType<string>> => {
    try {
      const user = await User.findOne({ email, isEnabled: true });
      if (!user) {
        return {
          error: "Email inválido",
          status: false,
        };
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const token = tokenUtils.generate(
        {
          id: user._id,
          email: user.email,
          code: code,
        },
        {
          expiresIn: "15m",
        }
      );

      const html = await mailUtils.template({
        type: EMailTYpes.CHANGE_PASSWORD,
        data: {
          username: user.fullname,
          code: code,
        },
      });

      mailUtils.sendMail({
        to: user.email,
        subject: "Recuperar senha",
        html: html,
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

      if (decodedToken.code !== otp) {
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

      return {
        data: {
          ...user.toJSON(),
          token: token,
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

  setPassword: async (token: string, password: string) => {
    try {
      const docodedToken = tokenUtils.verify(token);
      console.log(token, password, docodedToken);

      if (!docodedToken) {
        return {
          error: "Aconteceu um erro ao atualizar a senha",
          status: false,
        };
      }

      const user = await User.findById(docodedToken.id);
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

      await user.save();

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
};
