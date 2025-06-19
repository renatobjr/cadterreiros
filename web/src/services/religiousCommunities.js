import api from "@/configs/api.config";

const religiousCommunitiesURL = "religiousCommunities";

export const religiousCommunityService = {
  list: async (options) => {
    const response = await api.get(`${religiousCommunitiesURL}/list`, {
      params: {
        search: options
      },
    });
    console.log(response);
    if (response.status) {
      return response.results;
    }
    return [];
  },
  getRamdom: async () => {
    const response = await api.get(`${religiousCommunitiesURL}/ramdom`);
    if (response.status) {
      return response.results;
    }
    return [];
  },
  getDataFromMaping: async () => {
    const response = await api.get(`${religiousCommunitiesURL}/maping`);

    if (response.status) {
      return response.results;
    }
    return [];
  },
  getCommunityById: async (id) => {
    const response = await api.get(`${religiousCommunitiesURL}/${id}`);
    if (response.status) {
      return response.results;
    }
    return "";
  },
};
