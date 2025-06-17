<script setup>
import { GoogleMap, Marker, MarkerCluster } from "vue3-google-map";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import cadMarkerCluster from "@/assets/svg/marker.cluster.svg";
import cadMarkerSimple from "@/assets/svg/marker.simple.svg";
import normalizer from "@/utils/normalizer";
import router from "@/router";
import { baseRoute } from "@/router/base";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const communitiesToday = computed(() => {
  return religiousCommunitiesStore.ramdomReligiousCommunityList;
});

const validCommunities = computed(() =>
  communitiesToday.value.filter((c) => c.lat && c.long)
);

const center = computed(() => {
  if (!validCommunities.value.length) return null;

  const latitudes = validCommunities.value.map((c) => c.lat);
  const longitudes = validCommunities.value.map((c) => c.long);

  return {
    lat: latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
    lng: longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
  };
});

const hasValidCenter = computed(() => center.value !== null);

const renderer = {
  render({ count, position }) {
    return new google.maps.Marker({
      position,
      label: {
        text: String(count),
        color: "#ffffff",
        fontSize: "14px",
      },
      icon: {
        url: cadMarkerCluster,
        scaledSize: new google.maps.Size(40, 40),
      },
      zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
    });
  },
};

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
        v-if="isLoading || !hasValidCenter"
        class="d-flex justify-center align-center"
        style="height: 600px"
      >
        <v-progress-circular indeterminate color="white" size="50" />
      </div>

      <GoogleMap
        v-else
        class="map rounded-lg elevation-3"
        api-key="AIzaSyCww53qH4bTw9z2le42RZu0QFam20AiuyU"
        disableDefaultUi="false"
        :center="center"
        :zoom="13"
      >
        <MarkerCluster :options="{ renderer }">
          <Marker
            v-for="(community, i) in communitiesToday"
            :key="i"
            :options="{
              position: {
                lat: community.lat,
                lng: community.long,
              },
              icon: {
                url: cadMarkerSimple,
                scaledSize: { width: 40, height: 40 },
              },
              title:
                normalizer.capitalize(community.religiousSpaceName) ||
                community.religiousSpaceName,
            }"
            @click="goToCommunity(community.slugify, community.id)"
          />
        </MarkerCluster>
      </GoogleMap>
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
