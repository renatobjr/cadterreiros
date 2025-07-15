import api from "@/configs/axios.config";

const authURL = "auth";

export const authService = {
  login: async (payload) => {
    const response = await api.post(`${authURL}/login`, payload);
    return response.data;
  },

  validateToken: async (token) => {
    const response = await api.post(`${authURL}/validate-token`, null, {
      headers: {
        "X-Access-Token": `Bearer ${token}`,
      },
    });
    return response.data;
  },
}
