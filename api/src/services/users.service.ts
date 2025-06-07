import { ApiResponseType } from "../@types/responsesTypes";
import { IUser, User } from "@/api/schemas/User";

export const usersService = {
  list: async (): Promise<ApiResponseType<IUser[]>> => {
    try {
      const users = await User.find();

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
};
