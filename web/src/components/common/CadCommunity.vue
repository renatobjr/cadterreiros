<script setup>
import cadMarkerSimple from "@/assets/svg/marker.simple.svg";
import dayjs from "dayjs";
import { GoogleMap, Marker } from "vue3-google-map";

defineProps({
  community: {
    type: Object,
    required: true,
  },
});

const imgAPI = import.meta.env.VITE_IMG_RELIGIOUS_COMMUNITY_URL;

const fileUrl = (filename) => {
  if (filename) {
    return `${imgAPI}/${filename}`;
  }
};
</script>

<template>
  <v-container class="mx-auto cad-container" max-width="160vh">
    <v-card
      class="d-flex flex-column h-100 pa-4 rounded-lg"
      color="grey-lighten-5"
      elevation="0"
    >
      <div class="d-flex flex-column justify-space-between">
        <v-card-title class="text-h6 mb-2">
          {{ community[0].religiousSpaceName }}
          <span class="text-subtitle-1 d-block font-weight-light">{{
            `Recenseado em ${dayjs(community[0].createdAt).format(
              "DD/MM/YYYY"
            )} por ${community[0].censusTaker}`
          }}</span>
        </v-card-title>
        <v-card-subtitle>
          <v-chip label variant="outlined" class="text-capitalize mr-2">
            {{ `Fundado em ${community[0].religiousSpaceYearFoundation}` }}
          </v-chip>
          <cad-chip :community="community[0].communityType" />
          <cad-chip :community="community[0].religiousSpaceNation" />
        </v-card-subtitle>

        <v-card-text class="mt-8">
          {{ community[0].bio }}
          <v-img
            :src="fileUrl(community[0].religiousSpaceMainPicture)"
            cover
            class="mt-8 rounded-lg main-picture"
          ></v-img>
        </v-card-text>

        <GoogleMap
          class="map rounded-lg mt-8 mb-8"
          api-key="AIzaSyCww53qH4bTw9z2le42RZu0QFam20AiuyU"
          disableDefaultUi="false"
          :center="{ lat: community[0].lat, lng: community[0].long }"
          :zoom="15"
        >
          <Marker
            :options="{
              position: {
                lat: community[0].lat,
                lng: community[0].long,
              },
              icon: {
                url: cadMarkerSimple,
                scaledSize: { width: 40, height: 40 },
              },
            }"
          ></Marker>
        </GoogleMap>
      </div>
    </v-card>
  </v-container>
</template>

<style scoped>
.map {
  margin: 0 auto;
  width: 150vh;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
}

.main-picture {
  width: 100%;
  height: 500px;
  object-fit: cover;
}
</style>
