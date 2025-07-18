<script setup>
import dayjs from "dayjs";
import { GoogleMap, Marker } from "vue3-google-map";
import cadMarkerSimple from "@/assets/svg/marker.simple.svg";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import { setChipColor } from "@/utils/setChipColor";
import { ECensusStep } from "@/enum/ECensusStep";
import router from "@/router";
import { authRoute } from "@/router/auth";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS;
const imgAPI = import.meta.env.VITE_IMG_RELIGIOUS_COMMUNITY_URL;

const religiousCommunitiesStore = useReligiousCommunitiesStore();
const route = useRoute();

const isLoading = ref(true);
const community = ref({});
const showSetRequestCorrections = ref(false);

const communityId = route.params.id;

onMounted(async () => {
  window.scrollTo(0, 0);
  await religiousCommunitiesStore.getPrivateCommunityId(communityId);

  if (religiousCommunitiesStore.community) {
    community.value = religiousCommunitiesStore.community;
    isLoading.value = false;
  }
});

const fileUrl = (filename) => {
  if (filename) {
    return `${imgAPI}/${filename}`;
  }
};

const setChipCensusStepLabel = (censusStep) => {
  switch (censusStep) {
    case ECensusStep.PENDING:
      return "Pendente";
    case ECensusStep.REJECTED:
      return "Rejeitado";
    default:
      return "Aprovado";
  }
};

const setRequestCorrections = () => {
  showSetRequestCorrections.value = true;
};

const onRequestCorrections = async (data) => {
  if (data.status) {
    showSetRequestCorrections.value = false;
    router.push({ name: authRoute.dashboard });
  }
};
</script>

<template>
  <div
    v-if="isLoading"
    class="d-flex justify-center align-center"
    style="height: 600px"
  >
    <cad-global-loader :isLoading="isLoading" />
  </div>
  <v-container class="pa-10" fluid v-else>
    <v-card class="d-flex flex-column h-100 pa-8 rounded-lg">
      <v-card-title class="text-h6 mb-2">
        {{ community[0].religiousSpaceName }}
        <span class="text-subtitle-1 d-block font-weight-light">{{
          `Recenseado em ${dayjs(community[0].createdAt).format(
            "DD/MM/YYYY"
          )} por ${community[0].censusTakerFullname}`
        }}</span>
      </v-card-title>
      <v-card-subtitle>
        <v-chip label variant="outlined" class="text-capitalize mr-2">
          {{ `Fundado em ${community[0].religiousSpaceYearFoundation}` }}
        </v-chip>
        <cad-chip :community="community[0].communityType" />
        <cad-chip :community="community[0].religiousSpaceNation" />
        <v-chip
          :color="setChipColor(community[0].censusStep)"
          class="ma-1 text-capitalize"
          variant="flat"
          small
          label
        >
          {{ setChipCensusStepLabel(community[0].censusStep) }}
        </v-chip>
        <v-btn
          class="float-right"
          density="default"
          color="warning"
          variant="flat"
          @click="setRequestCorrections(community[0].id)"
          >Solicitar correções</v-btn
        >
      </v-card-subtitle>

      <v-card-text class="mt-8">
        <v-row>
          <v-col cols="4">
            <v-row>
              <v-img
                :src="fileUrl(community[0].religiousSpaceMainPicture)"
                cover
                class="rounded-lg main-picture"
              ></v-img>
              <GoogleMap
                class="map rounded-lg mt-8 mb-8"
                :api-key="apiKey"
                disableDefaultUi="false"
                :center="{
                  lat: community[0].communityGoogleApiLocalization.lat,
                  lng: community[0].communityGoogleApiLocalization.long,
                }"
                :zoom="15"
              >
                <Marker
                  :options="{
                    position: {
                      lat: community[0].communityGoogleApiLocalization.lat,
                      lng: community[0].communityGoogleApiLocalization.long,
                    },
                    icon: {
                      url: cadMarkerSimple,
                      scaledSize: { width: 40, height: 40 },
                    },
                  }"
                ></Marker>
              </GoogleMap>
            </v-row>
          </v-col>
          <v-col cols="8">
            <cad-table-community :community="community[0]" />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    {{ community }}
  </v-container>

  <cad-request-corrections-dialog
    v-model="showSetRequestCorrections"
    :community-id="communityId"
    @on-request-corrections="onRequestCorrections"
  />
</template>

<style scoped>
.map {
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
}

.main-picture {
  width: 100%;
  height: 500px;
  object-fit: cover;
}
</style>
