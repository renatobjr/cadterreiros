<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";

const religiousCommunitiesStore = useReligiousCommunitiesStore();
const route = useRoute();

const isLoading = ref(true);
const community = ref({});

let id = route.params.id;

onMounted(async () => {
  window.scrollTo(0, 0);
  await religiousCommunitiesStore.getCommunityId(id);

  if (religiousCommunitiesStore.community) {
    community.value = religiousCommunitiesStore.community;
    isLoading.value = false;
  }
});
</script>

<template>
  <div
    v-if="isLoading"
    class="d-flex justify-center align-center"
    style="height: 600px"
  >
    <cad-global-loader :isLoading="isLoading" />
  </div>
  <cad-community :community="community" v-else />
</template>
