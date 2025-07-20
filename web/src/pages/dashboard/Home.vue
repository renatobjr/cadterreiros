<script setup>
import { computed, provide, ref, watch } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";

const tab = ref("approved");
const authStore = useAuthStore();
const religiousCommunitiesStore = useReligiousCommunitiesStore();

const isGlobalLoading = computed(() => religiousCommunitiesStore.isLoading);

const refreshTrigger = ref(0);

const refreshAllTables = () => {
  refreshTrigger.value++;
};

provide("refreshTrigger", refreshTrigger);
provide("refreshAllTables", refreshAllTables);

watch(tab, () => {
  refreshAllTables();
});
</script>

<template>
  <v-container class="pa-10" fluid>
    <v-overlay
      :model-value="isGlobalLoading"
      opacity="0.6"
      class="z-10 d-flex justify-center align-center"
      persistent
    >
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

    <v-card
      class="d-flex flex-column h-100 pa-4 rounded-lg"
      elevation="1"
      :title="`Olá, ${authStore.user.fullname}!`"
      subtitle="Aqui você pode visualizar as comunidades cadastradas na nossa base de dados, use o sistema de busca para encontrar um Terreiro."
    >
      <v-tabs v-model="tab">
        <v-tab value="approved">Comunidades Aprovadas</v-tab>
        <v-tab value="pending">Comunidades Pendentes</v-tab>
        <v-tab value="rejected">Comunidades Rejeitadas</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="approved">
          <cad-data-table-communities-approved />
        </v-tabs-window-item>
        <v-tabs-window-item value="pending">
          <cad-data-table-communities-pending />
        </v-tabs-window-item>
        <v-tabs-window-item value="rejected">
          <cad-data-table-communities-rejected />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </v-container>
</template>
