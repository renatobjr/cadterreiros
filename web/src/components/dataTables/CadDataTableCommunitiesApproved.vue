<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import { setChipColor } from "@/utils/setChipColor";
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { ECensusStep } from "@/enum/ECensusStep";
import router from "@/router";
import { authRoute } from "@/router/auth";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const refreshTrigger = inject("refreshTrigger");
const refreshAllTables = inject("refreshAllTables");

const search = ref("");
const searchParams = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});
const isLoaded = ref(true);

const showSetOwnerDialog = ref(false);
const showSetCensusStepDialog = ref(false);
const selectedCommunity = ref();

const communities = ref([]);

const headers = ref([
  {
    title: "Nome do Espaço Religioso",
    key: "religiousSpaceName",
    sortable: true,
    visible: true,
  },
  {
    title: "Tipo de comunidade",
    key: "communityType",
    sortable: true,
    visible: true,
  },
  {
    title: "Status",
    key: "censusStep",
    sortable: true,
    visible: true,
  },
  {
    title: "Nação",
    key: "religiousSpaceNation",
    sortable: true,
    visible: true,
  },
  { title: "Bairro", key: "neighborhood", sortable: true, visible: true },
  { title: "Cidade", key: "city", sortable: true, visible: true },
  {
    title: "Recenseador",
    key: "censusTakerFullname",
    sortable: true,
    visible: true,
  },
  { title: "censusTakerId", key: "censusTakerId", visible: false },
  { title: "Acṍes", key: "actions", visible: true },
]);

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

const visibleHeaders = computed(() => {
  return headers.value.filter((header) => header.visible !== false);
});

const itemsPerPage = ref(10);
let totalItems = 0;

const initializeData = async () => {
  await religiousCommunitiesStore.listWithUserId(
    search.value,
    ECensusStep.APPROVED
  );
  await loadCommunities(searchParams);
};

onMounted(async () => {
  await initializeData();
});

watch(refreshTrigger, async () => {
  await initializeData();
});

watch(search, async (generic) => {
  await religiousCommunitiesStore.listWithUserId(generic, ECensusStep.APPROVED);
  await loadCommunities(searchParams);
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
  router.push({
    name: authRoute.communityPrivated,
    params: { id, slug },
    state: {
      fromApproved: true,
    },
  });
};

const setOwner = (id) => {
  showSetOwnerDialog.value = true;
  selectedCommunity.value = id;
};

const onOwnerAssigned = async (data) => {
  if (data.status) {
    await religiousCommunitiesStore.listWithUserId(
      search.value,
      ECensusStep.APPROVED
    );
    await loadCommunities({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
    });

    useSnackbarStore().showSnackbar({
      message: "Recenseador atribuido com sucesso!",
      color: "green",
    });

    selectedCommunity.value = null;
    refreshAllTables();
  }
};

const setCommunityStatus = (id) => {
  showSetCensusStepDialog.value = true;
  selectedCommunity.value = id;
};

const onCensusStepAssigned = async (data) => {
  if (data.status) {
    await religiousCommunitiesStore.listWithUserId(
      search.value,
      ECensusStep.APPROVED
    );
    await loadCommunities({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
    });

    useSnackbarStore().showSnackbar({
      message: "Status da comunidade alterado com sucesso!",
      color: "green",
    });

    selectedCommunity.value = null;
    refreshAllTables();
  }
};
</script>

<template>
  <p class="pa-4 text-h5">Comunidades aprovadas</p>
  <v-text-field
    class="pa-4"
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
    :headers="visibleHeaders"
    item-value="religiousSpaceName"
    :items="communities"
    :items-length="totalItems"
    :loading="isLoaded"
    loading-text="Carregando..."
    no-data-text="Nenhum Terreiro encontrado"
    multi-sort
    @update:options="loadCommunities"
  >
    <template #item.communityType="{ item }">
      <span class="text-capitalize">
        {{ item.communityType }}
      </span>
    </template>

    <template #item.censusStep="{ item }">
      <v-chip
        :color="setChipColor(item.censusStep)"
        class="ma-1 text-capitalize"
        variant="flat"
        small
        label
      >
        {{ setChipCensusStepLabel(item.censusStep) }}
      </v-chip>
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

    <template cvl #item.actions="{ item }">
      <v-tooltip text="Ver registro da comunidade" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="mr-2"
            size="small"
            color="black"
            variant="tonal"
            @click="goToCommunity(item.slugify, item.id)"
          >
            <v-icon size="large">mdi-eye</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Atribuir a outro recenseador" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="mr-2"
            size="small"
            color="warning"
            variant="flat"
            @click="setOwner(item.id)"
          >
            <v-icon size="large">mdi-account-alert</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
      <v-tooltip text="Atribuir status a comunidade" location="top">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            class="mr-2"
            size="small"
            color="error"
            variant="flat"
            @click="setCommunityStatus(item.id)"
          >
            <v-icon size="large">mdi-list-status</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </template>
  </v-data-table-server>

  <cad-set-owner-dialog
    v-model="showSetOwnerDialog"
    :community-id="selectedCommunity"
    @on-owner-assigned="onOwnerAssigned"
  />

  <cad-set-census-step-dialog
    v-model="showSetCensusStepDialog"
    :community-id="selectedCommunity"
    @on-census-step-assigned="onCensusStepAssigned"
  />
</template>
