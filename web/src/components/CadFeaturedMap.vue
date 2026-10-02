<script setup>
import { ref, computed, onMounted } from "vue"; // 1. Importar ref e onMounted
import CadMap from "@/components/common/CadMap.vue";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import normalizer from "@/utils/normalizer";
import router from "@/router";
import { baseRoute } from "@/router/base";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const communitiesToday = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  await religiousCommunitiesStore.getRandom();
  communitiesToday.value =
    religiousCommunitiesStore.ramdomReligiousCommunityList;
  isLoading.value = false;
});

const validCommunities = computed(() =>
  communitiesToday.value.filter((c) => c.lat && c.long)
);

const center = computed(() => {
  if (validCommunities.value.length === 0) {
    return { lat: -7.1195, lng: -34.8451 };
  }

  const latitudes = validCommunities.value.map((c) => parseFloat(c.lat));
  const longitudes = validCommunities.value.map((c) => parseFloat(c.long));

  return {
    lat: latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
    lng: longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
  };
});

const canRenderMap = computed(
  () => !isLoading.value && validCommunities.value.length > 0
);

const markers = computed(() =>
  validCommunities.value.map((community) => ({
    lat: parseFloat(community.lat),
    lng: parseFloat(community.long),
    title:
      normalizer.capitalize(community.religiousSpaceName) ||
      community.religiousSpaceName,
    slug: community.slugify,
    id: community.id,
  }))
);

const goToCommunity = (slug, id) => {
  router.push({ name: baseRoute.community, params: { id, slug } });
};
</script>

<template>
  <div class="d-flex justify-center bg-jeje">
    <v-container class="mx-auto cad-container" max-width="160vh">
      <p class="text-h4 text-md-h4 font-weight-bold text-white mb-2">
        Terreiros em destaque
      </p>
      <p class="text-h6 text-md-h5 font-weight-light text-white mb-10">
        Veja alguns dos terreiros cadastrados na Região Metropolitana de João
        Pessoa.
        <br />
        Use nosso repositório em "Buscar um Terreiro" para encontrar espaços
        utilizando nossos filtros de busca, ou Cadastre um novo espaço
        religioso.
      </p>

      <div
        v-if="isLoading"
        class="d-flex justify-center align-center"
        style="height: 600px"
      >
        <v-progress-circular indeterminate color="white" size="50" />
      </div>

      <CadMap
        v-show="canRenderMap"
        class="map rounded-lg elevation-3"
        :center="center"
        :zoom="13"
        :markers="markers"
        cluster
        @marker-click="goToCommunity($event.slug, $event.id)"
      />
    </v-container>
  </div>
</template>

<style scoped>
.map {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
