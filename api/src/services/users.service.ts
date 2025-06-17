import { ApiResponseType } from "../@types/responsesTypes";
import { IUser, User } from "@/api/schemas/User";

export const usersService = {
  list: async (): Promise<ApiResponseType<IUser[]>> => {
    try {
      const users = await User.find();

      return {
        results: users,
        status: true,
      };
    } catch (error: any) {
      return {
        results: error,
        status: true,
      };
    }
  },
};
