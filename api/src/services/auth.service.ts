import { ApiResponseType } from "../@types/responsesTypes";
import { IUser, User } from "../schemas/User";
import tokenUtils from "../utils/token.utils";
import bcrypt from "bcryptjs";

export const authService = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponseType<IUser | string>> => {
    try {
      let user = await User.findOne({ email, isEnabled: true });
      if (!user) {
        return {
          error: "User not found",
          status: false,
        };
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return {
          error: "Invalid password",
          status: false,
        };
      }

      const generateToken = tokenUtils.generate({ id: user._id });
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
};
