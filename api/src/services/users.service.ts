import { ApiResponseType } from "../@types/responsesTypes";
import { ERole, IUser, User } from "@/api/schemas/User";
import mailUtils from "../utils/mail.utils";
import { EMailTypes } from "../enum/EmailTYpes.enum";

export const usersService = {
  list: async (): Promise<ApiResponseType<IUser[]>> => {
    try {
      const users = await User.find({ isEnabled: true, isFirstLogin: false });

      return {
        data: users,
        status: true,
      };
    } catch (error: any) {
      return {
        data: error,
        status: true,
      };
    }
  },

  listAll: async (): Promise<ApiResponseType<IUser[]>> => {
    try {
      const users = await User.find({ isFirstLogin: false });

      return {
        data: users,
        status: true,
      };
    } catch (error: any) {
      return {
        data: error,
        status: true,
      };
    }
  },

  setUserStatus: async (
    id: string,
    status: boolean
  ): Promise<ApiResponseType<IUser>> => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { isEnabled: status } },
        { new: true }
      );
      return {
        data: user as IUser,
        status: true,
      };
    } catch (error: any) {
      return {
        data: error,
        status: true,
      };
    }
  },

  changeUserRole: async (
    id: string,
    role: string
  ): Promise<ApiResponseType<IUser>> => {
    try {
      const user = await User.findOneAndUpdate(
        { _id: id },
        { $set: { role: role } },
        { new: true }
      );
      return {
        data: user as IUser,
        status: true,
      };
    } catch (error: any) {
      return {
        data: error,
        status: true,
      };
    }
  },

  addUser: async (
    email: string,
    role: ERole,
    fullname?: string
  ): Promise<ApiResponseType<IUser | string>> => {
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return {
          error: "Esse email ja foi cadastrado",
          status: false,
        };
      }

      const user = await User.create({
        email,
        role,
        ...(fullname?.trim() ? { fullname: fullname.trim() } : {}),
      });

      const html = await mailUtils.template({
        type: EMailTypes.ADD_USER,
        data: {
          email: user.email,
          fullname: user.fullname || user.email,
          role:
            user.role === ERole.ADMIN
              ? "Administrador (curador)"
              : "Recenseador",
        },
      });

      await mailUtils.sendMail({
        to: user.email,
        subject: "Seu acesso ao Cadterreiros",
        html: html,
      });

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
