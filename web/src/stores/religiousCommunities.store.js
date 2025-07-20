import { religiousCommunityService } from '@/services/religiousCommunities';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useReligiousCommunitiesStore = defineStore('religiousCommunities', () => {
  let isLoading = ref(false);
  let community = ref({});
  let communityList = ref([]);
  let totalReligiousCommunities = ref(0);
  let ramdomReligiousCommunityList = ref([]);
  let dataFromMapping = ref([]);

  let religiousCommunity = ref({
    authorization: undefined,
    communityGoogleApiLocalization: { lat: 0, long: 0 },
    communityAddress: {
      fullAddress: undefined,
      street: undefined,
      number: undefined,
      neighborhood: undefined,
      city: undefined,
      state: undefined,
      zipcode: undefined,
    },
    communityType: undefined,
    religiousSpaceYearFoundation: 0,
    religiousSpaceLeaderFoundation: undefined,
    religiousSpaceNation: undefined,
    religiousSpacePraticalLanguages: undefined,
    religiousSpaceName: undefined,
    religiousSpaceLeaderName: undefined,
    religiousSpacePositionName: undefined,
    religiousSpaceStartedBy: undefined,
    religiousSpaceNameDateStartedBy: undefined,
    leaderContacts: {
      phone: undefined,
      mobile: undefined,
      email: undefined,
    },
    leaderEthnicity: undefined,
    leaderGender: undefined,
    leaderEducationalLevel: undefined,
    leaderSocialProgram: undefined,
    leaderSufferedRacism: false,
    religiousSpaceMainPicture: undefined,
  });

  async function list(options) {
    isLoading.value = true;
    try {
      communityList.value = await religiousCommunityService.list(options);
    } finally {
      isLoading.value = false;
    }
  }

  async function listWithUserId(options, censusStep) {
    isLoading.value = true;
    try {
      communityList.value = await religiousCommunityService.listWithUserId(options, censusStep);
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchData({ page, itemsPerPage, sortBy }) {
    if (communityList) {
      totalReligiousCommunities.value = communityList.value.length;

      return new Promise((resolve) => {
        const start = (page - 1) * itemsPerPage;
        const end = page * itemsPerPage;

        if (sortBy.length) {
          const sortKey = sortBy[0].key;
          const sortOrder = sortBy[0].order;

          communityList.value.sort((a, b) => {
            const aValue = a[sortKey];
            const bValue = b[sortKey];

            if (sortOrder === "asc") return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            else return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          });
        }

        const paginated = communityList.value.slice(start, end);

        resolve({ items: paginated, total: communityList.value.length });
      });
    }
  }

  async function getRandom() {
    isLoading.value = true;
    try {
      ramdomReligiousCommunityList.value = await religiousCommunityService.getRandom();
    } finally {
      isLoading.value = false;
    }
  }

  async function getDataFromMaping() {
    isLoading.value = true;
    try {
      dataFromMapping.value = await religiousCommunityService.getDataFromMaping();
    } finally {
      isLoading.value = false;
    }
  }

  async function getCommunityId(id) {
    isLoading.value = true;
    try {
      community.value = await religiousCommunityService.getCommunityById(id);
    } finally {
      isLoading.value = false;
    }
  }

  async function getPrivateCommunityId(id) {
    isLoading.value = true;
    try {
      community.value = await religiousCommunityService.getPrivateCommunityById(id);
    } finally {
      isLoading.value = false;
    }
  }

  async function assignOwner(communityId, userId, keepStatus) {
    isLoading.value = true;
    try {
      return await religiousCommunityService.assignOwner(communityId, userId, keepStatus);
    } finally {
      isLoading.value = false;
    }
  }

  async function setCensusStep(communityId, step, rejectedReason) {
    isLoading.value = true;
    try {
      return await religiousCommunityService.setCensusStep(communityId, step, rejectedReason);
    } finally {
      isLoading.value = false;
    }
  }

  async function requestCorrections(communityId, userId, rejectedReason) {
    isLoading.value = true;
    try {
      return await religiousCommunityService.requestCorrections(communityId, userId, rejectedReason);
    } finally {
      isLoading.value = false;
    }
  }

  async function approveCensus(communityId) {
    isLoading.value = true;
    try {
      return await religiousCommunityService.approveCensus(communityId);
    } finally {
      isLoading.value = false;
    }
  }

  async function rejectCensus(communityId, rejectedReason) {
    isLoading.value = true;
    try {
      return await religiousCommunityService.rejectCensus(communityId, rejectedReason);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    community,
    communityList,
    totalReligiousCommunities,
    ramdomReligiousCommunityList,
    dataFromMapping,
    religiousCommunity,
    list,
    listWithUserId,
    fetchData,
    getRandom,
    getDataFromMaping,
    getCommunityId,
    getPrivateCommunityId,
    assignOwner,
    setCensusStep,
    requestCorrections,
    approveCensus,
    rejectCensus
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReligiousCommunitiesStore, import.meta.hot));
}
