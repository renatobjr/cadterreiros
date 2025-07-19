<script setup>
import { useAuthStore } from "@/stores/auth.store";

const tab = ref("approved");
const authStore = useAuthStore();

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
