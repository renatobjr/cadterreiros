import { authService } from "@/services/auth";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useAuthStore = defineStore("auth", () => {
  const user = reactive({
    id: null,
    email: null,
    fullname: null,
  });

  const loggedToken = ref(null);
  let recoveryEmail = ref(null);

  const isAuth = computed(() => {
    return loggedToken.value !== null;
  });

  const setLoginData = (data, token) => {
    user.id = data.user.id;
    user.email = data.user.email;
    user.fullname = data.user.fullname;
    loggedToken.value = token;
  };

  const clearLoginData = () => {
    user.id = null;
    user.email = null;
    user.fullname = null;
    loggedToken.value = null;
  };

  async function login(payload) {
    payload.origin = 'web';
    const response = await authService.login(payload);

    if (response.status) {
      setLoginData(response.data, response.data.token);
      localStorage.setItem("SESSION_TOKEN", response.data.token);
    }
    return response;
  };

  async function forgetPassword(userEmail) {
    const response = await authService.forgetPassword(userEmail);

    if (response.status) {
      recoveryEmail.value = userEmail;
    }
    return response;
  };

  function logout() {
    clearLoginData();
    localStorage.removeItem("SESSION_TOKEN");
  };

  async function checkAuth() {
    const token = localStorage.getItem("SESSION_TOKEN");
    if (token) {
      const response = await authService.validateToken(token);
      if (response.status) {
        setLoginData(response.data, token);
        return true;
      }
    }
    return false;
  };

  async function verifyOTP(token, otp) {
    const response = await authService.verifyOTP(token, otp);
    return response;
  };

  async function setPassword(token, password) {
    const response = await authService.setPassword(token, password);
    return response;
  };

  return {
    user,
    loggedToken,
    isAuth,
    setLoginData,
    clearLoginData,
    recoveryEmail,

    login,
    forgetPassword,
    logout,
    checkAuth,
    verifyOTP,
    setPassword
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
