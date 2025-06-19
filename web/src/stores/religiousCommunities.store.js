import { religiousCommunityService } from '@/services/religiousCommunities';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useReligiousCommunitiesStore = defineStore('religiousCommunities', () => {
  let community = ref({});
  let communityList = ref([]);
  let totalReligiousCommunities = ref(0);
  let ramdomReligiousCommunityList = ref([]);
  let dataFromMapping = ref([]);

  async function list(options) {
    communityList.value = await religiousCommunityService.list(options);
  }

  async function fetchData({
    page,
    itemsPerPage,
    sortBy
  }) {
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

            if (sortOrder === "asc") {
              return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
              return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
          });
        }

        const paginated = communityList.value.slice(start, end);

        resolve({
          items: paginated,
          total: communityList.value.length
        })
      })
    }
  }

  async function getRamdom() {
    ramdomReligiousCommunityList.value = await religiousCommunityService.getRamdom();
  }

  async function getDataFromMaping() {
    dataFromMapping.value = await religiousCommunityService.getDataFromMaping();
  }

  async function getCommunityId(id) {
    community.value = await religiousCommunityService.getCommunityById(id);
  }

  return { community, communityList, totalReligiousCommunities, ramdomReligiousCommunityList, dataFromMapping, list, fetchData, getRamdom, getDataFromMaping, getCommunityId };
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReligiousCommunitiesStore, import.meta.hot));
}
