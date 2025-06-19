<script setup>
import router from "@/router";
import { ref, watch, onMounted } from "vue";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import { setChipColor } from "@/utils/setChipColor";
import { baseRoute } from "@/router/base";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const tab = ref("search");
const search = ref("");
const isLoaded = ref(true);

const communities = ref([]);
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

const goToCommunity = (slug, id) => {
  router.push({ name: baseRoute.community, params: { id, slug } });
};
</script>

<template>
  <v-container class="mx-auto cad-container" max-width="160vh">
    <v-card
      class="d-flex flex-column h-100 pa-4 rounded-lg"
      color="grey-lighten-5"
      elevation="2"
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
          <v-card-title>Mapa</v-card-title>
          <!-- Aqui você pode adicionar seu componente de mapa no futuro -->
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-container>
</template>
