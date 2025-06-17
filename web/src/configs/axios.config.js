import $axios from "axios";

const axios = $axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axios.interceptors.request.use(
  function (config) {
    return config;
  },
  (error) => Promise.reject(error)
)

axios.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
)

export default axios
