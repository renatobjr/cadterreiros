import api from "@/configs/axios.config";

const authURL = "auth";

export const authService = {
  login: async (payload) => {
    const response = await api.post(`${authURL}/login`, payload);
    return response.data;
  },

  generateUserToken: async (userEmail, isFromForget) => {
    const response = await api.get(
      `${authURL}/generate-user-token/${userEmail}/${isFromForget}`
    );
    return response.data;
  },

  verifyOTP: async (token, otp) => {
    const response = await api.post(`${authURL}/verify-otp`, { token, otp });
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

  setPassword: async (token, password, fullname) => {
    const response = await api.post(`${authURL}/set-password`, {
      token,
      password,
      fullname,
    });
    return response.data;
  },
};
