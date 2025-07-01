<script setup>
import { baseRoute } from "@/router/base";
import { GoogleMap, Marker, MarkerCluster } from "vue3-google-map";
import { ref, watch, onMounted } from "vue";
import { setChipColor } from "@/utils/setChipColor";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import cadMarkerCluster from "@/assets/svg/marker.cluster.svg";
import cadMarkerSimple from "@/assets/svg/marker.simple.svg";
import normalizer from "@/utils/normalizer";
import router from "@/router";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const tab = ref("search");
const search = ref("");
const isLoaded = ref(true);

const communities = ref([]);
const communitiesToMap = computed(() => {
  return religiousCommunitiesStore.communityList;
});

const headers = ref([
  {
    title: "Nome do Espaço Religioso",
    key: "religiousSpaceName",
    sortable: true,
  },
  { title: "Tipo de comunidade", key: "communityType", sortable: true },
  {
    title: "Ano de fundação",
    key: "religiousSpaceYearFoundation",
    sortable: true,
  },
  { title: "Nação", key: "religiousSpaceNation", sortable: true },
  { title: "Bairro", key: "neighborhood", sortable: true },
  { title: "Cidade", key: "city", sortable: true },
  { title: "Visualizar", key: "actions" },
]);

const itemsPerPage = ref(10);
let totalItems = 0;

onMounted(async () => {
  await religiousCommunitiesStore.list(search.value);
  await loadCommunities({
    page: 1,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
  });
});

watch(search, async (generic) => {
  await religiousCommunitiesStore.list(generic);
  await loadCommunities({
    page: 1,
    itemsPerPage: itemsPerPage.value,
    sortBy: [],
  });
});

const loadCommunities = async ({ page, itemsPerPage, sortBy }) => {
  isLoaded.value = true;

  await religiousCommunitiesStore
    .fetchData({
      page,
      itemsPerPage,
      sortBy,
    })
    .then(({ items, total }) => {
      communities.value = items;
      totalItems = total;
    });

  isLoaded.value = false;
};

const center = computed(() => {
  if (!communitiesToMap.value.length) return null;

  const latitudes = communitiesToMap.value.map((c) => c.lat);
  const longitudes = communitiesToMap.value.map((c) => c.long);

  return {
    lat: latitudes.reduce((a, b) => a + b, 0) / latitudes.length,
    lng: longitudes.reduce((a, b) => a + b, 0) / longitudes.length,
  };
});

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
  <v-container class="mx-auto cad-container" max-width="160vh">
    <v-card
      class="d-flex flex-column h-100 pa-4 rounded-lg"
      color="grey-lighten-5"
      elevation="0"
      title="Buscar um Terreiro"
      subtitle="Encontre um Terreiro cadastrado na nossa base de dados"
      text="Você pode buscar um Terreiro pelo nome ou usar o nosso mapa interativo."
    >
      <v-tabs v-model="tab" color="red">
        <v-tab value="search">Buscar um Terreiro</v-tab>
        <v-tab value="maps">Visualizar no mapa</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="search">
          <v-text-field
            class="mt-6"
            v-model="search"
            label="Buscar"
            prepend-inner-icon="mdi-magnify"
            density="compact"
            variant="outlined"
            hide-details
            single-line
            clearable
          ></v-text-field>

          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            :headers="headers"
            item-value="religiousSpaceName"
            :items="communities"
            :items-length="totalItems"
            :loading="isLoaded"
            loading-text="Carregando..."
            no-data-text="Nenhum Terreiro encontrado"
            @update:options="loadCommunities"
          >
            <template #item.communityType="{ item }">
              <span class="text-capitalize">
                {{ item.communityType }}
              </span>
            </template>

            <template #item.religiousSpaceNation="{ item }">
              <v-chip
                :color="setChipColor(item.religiousSpaceNation)"
                text-color="white"
                class="ma-1 text-capitalize"
                small
                label
              >
                {{ item.religiousSpaceNation }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <v-btn
                prepend-icon="mdi-eye"
                size="small"
                color="black"
                variant="tonal"
                @click="goToCommunity(item.slugify, item.id)"
                >Detalhes</v-btn
              >
            </template>
          </v-data-table-server>
        </v-tabs-window-item>

        <v-tabs-window-item value="maps">
          <div class="mt-6">
            <GoogleMap
              class="map rounded-lg elevation-3"
              api-key="AIzaSyCww53qH4bTw9z2le42RZu0QFam20AiuyU"
              disableDefaultUi="false"
              :center="center"
              :zoom="13"
            >
              <MarkerCluster :options="{ renderer }">
                <Marker
                  v-for="(community, i) in communitiesToMap"
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
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-container>
</template>

<style scoped>
.map {
  width: 100%;
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
}
</style>
