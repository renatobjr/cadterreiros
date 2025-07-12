import axios from "./axios.config";

export const get = async (url, params) => {
  const response = await axios.get(url, { params });
  return response.data
}

export default {
  get
}
