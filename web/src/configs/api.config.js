import axios from "./axios.config";

export const get = async (url, params) => {
  const response = await axios.get(url, { params });
  return response.data
}

export const put = async (url, data) => {
  const response = await axios.put(url, data);
  return response.data
}

export const post = async (url, data) => {
  const response = await axios.post(url, data);
  return response.data
}

export default {
  get,
  put,
  post
}
