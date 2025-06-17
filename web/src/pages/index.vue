<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

onMounted(async () => {
  window.scrollTo(0, 0);
  await religiousCommunitiesStore.getRamdom();
  await religiousCommunitiesStore.getDataFromMaping();
});
</script>

<template>
  <cad-hero />
  <cad-google-maps />
  <cad-grid-faq />
  <cad-map-numbers />
  <cad-showcase />
</template>
