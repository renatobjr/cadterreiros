import api from "@/configs/api.config";

const religiousCommunitiesURL = "religious-communities";

export const religiousCommunityService = {
  list: async (options) => {
    const response = await api.get(`${religiousCommunitiesURL}/public/list`, {
      search: options,
    });
    if (response.status) {
      return response.data;
    }
    return [];
  },
  getRandom: async () => {
    const response = await api.get(`${religiousCommunitiesURL}/public/random`);
    if (response.status) {
      return response.data;
    }

    return [];
  },
  getDataFromMaping: async () => {
    const response = await api.get(`${religiousCommunitiesURL}/public/maping`);

    if (response.status) {
      return response.data;
    }
    return [];
  },
  getCommunityById: async (id) => {
    const response = await api.get(`${religiousCommunitiesURL}/public/${id}`);
    if (response.status) {
      return response.data;
    }
    return "";
  },
};
