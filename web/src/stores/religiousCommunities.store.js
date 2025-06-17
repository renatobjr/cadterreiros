import { religiousCommunityService } from '@/services/religiousCommunities';
import { defineStore, acceptHMRUpdate } from 'pinia';
import { ref } from 'vue';

export const useReligiousCommunitiesStore = defineStore('religiousCommunities', () => {
  let community = ref({});
  let ramdomReligiousCommunityList = ref([]);
  let dataFromMapping = ref([]);

  async function getRamdom() {
    ramdomReligiousCommunityList.value = await religiousCommunityService.getRamdom();
  }

  async function getDataFromMaping() {
    dataFromMapping.value = await religiousCommunityService.getDataFromMaping();
  }

  async function getCommunityId(id) {
    community.value = await religiousCommunityService.getCommunityById(id);
  }

  return { community, ramdomReligiousCommunityList, dataFromMapping, getRamdom, getDataFromMaping, getCommunityId };
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useReligiousCommunitiesStore, import.meta.hot));
}
