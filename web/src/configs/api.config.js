import axios from "./axios.config";

const API_URL = import.meta.env.VITE_API_URL;

export const get = async (url, params) => {
  const response = await axios.get(`${API_URL}/${url}`, params);
  return response.data
}

export default {
  get
}
