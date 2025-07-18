import api from "@/configs/api.config";

const usersURL = "users";

export const userService = {
  list: async () => {
    const response = await api.get(`${usersURL}/list`);

    if (response.status) {
      return response.data;
    }
    return [];
  }
}
