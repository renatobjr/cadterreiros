import api from "@/configs/api.config";
import { ECensusStep } from "@/enum/ECensusStep";

const religiousCommunitiesURL = "religious-communities";

export const religiousCommunityService = {
  list: async (options) => {
    const response = await api.get(`${religiousCommunitiesURL}/public/list`, {
      search: options,
      censusStep: ECensusStep.APPROVED
    });
    if (response.status) {
      return response.data;
    }
    return [];
  },
  listWithUserId: async (options, step) => {
    const response = await api.get(`${religiousCommunitiesURL}/list`, {
      search: options,
      censusStep: step,
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
    const response = await api.get(`${religiousCommunitiesURL}/public/mapping`);
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
  getPrivateCommunityById: async (id) => {
    const response = await api.get(`${religiousCommunitiesURL}/${id}`);
    if (response.status) {
      return response.data;
    }
    return "";
  },

  assignOwner: async (communityId, userId, keepStatus) => {
    const response = await api.put(`${religiousCommunitiesURL}/assign-owner`, {
      communityId,
      userId,
      keepStatus
    });
    if (response.status) {
      return response
    }
    return "";
  },

  setCensusStep: async (communityId, step, rejectedReason) => {
    const response = await api.put(`${religiousCommunitiesURL}/set-census-step`, {
      communityId,
      step,
      rejectedReason
    });
    if (response.status) {
      return response
    }
    return "";
  },

  requestCorrections: async (communityId, userId, rejectedReason) => {
    const response = await api.put(`${religiousCommunitiesURL}/request-corrections`, {
      communityId,
      userId,
      rejectedReason
    });
    if (response.status) {
      return response
    }
    return "";
  },

  approveCensus: async (communityId) => {
    const response = await api.put(`${religiousCommunitiesURL}/approve-census`, {
      communityId
    });
    if (response.status) {
      return response
    }
    return "";
  },

  rejectCensus: async (communityId, rejectedReason) => {
    const response = await api.put(`${religiousCommunitiesURL}/reject-census`, {
      communityId,
      rejectedReason
    });
    if (response.status) {
      return response
    }
    return "";
  }
};
