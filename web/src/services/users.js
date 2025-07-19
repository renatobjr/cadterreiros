import api from "@/configs/api.config";

const usersURL = "users";

export const userService = {
  list: async () => {
    const response = await api.get(`${usersURL}/list`);
    if (response.status) {
      return response.data;
    }
    return [];
  },

  listAll: async () => {
    const response = await api.get(`${usersURL}/list-all`);
    if (response.status) {
      return response.data;
    }
    return [];
  },

  setUserStatus: async (id, status) => {
    const response = await api.put(`${usersURL}/set-user-status`, { id, status });
    if (response.status) {
      return response
    }
    return [];
  },

  changeUserRole: async (id, role) => {
    const response = await api.put(`${usersURL}/change-user-role`, { id, role });
    if (response.status) {
      return response
    }
    return [];
  },

  addUser: async (email, role) => {
    const response = await api.post(`${usersURL}/add-user`, {
      email,
      role
    });
    if (response.status) {
      return response
    }
    return [];
  }
}
