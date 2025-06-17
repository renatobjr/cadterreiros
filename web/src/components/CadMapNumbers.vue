<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const dataFromMapping = computed(() => {
  return religiousCommunitiesStore.dataFromMapping;
});

const infoCards = computed(() => [
  {
    icon: "mdi-home",
    title: "Terreiros Registrados",
    value: dataFromMapping?.value?.totalReligiousCommunities,
  },
  {
    icon: "mdi-city",
    title: "Cidades Recenseadas",
    value: dataFromMapping?.value?.totalCities,
  },
  {
    icon: "mdi-home-group",
    title: "Bairros percorridos",
    value: dataFromMapping?.value?.totalNeighborhoods,
  },
]);
</script>

<template>
  <div class="d-flex justify-center bg-gold">
    <v-container class="mx-auto cad-container" max-width="160vh">
      <p class="text-h4 text-md-h4 font-weight-bold text-black mb-2">
        Mapeamento em números
      </p>
      <p class="text-h6 text-md-h5 font-weight-light text-black mb-10">
        Quantos somos? Onde estamos?
        <br />
        Dados estatísticos sobre as Comunidades de Matriz Africana e Terreiros
        na Região Metropolitana de João Pessoa
      </p>
      <v-row>
        <v-col cols="4" v-for="info in infoCards" :key="info">
          <v-card
            class="d-flex flex-column h-100 pa-10 rounded-xl text-center"
            color="sealbronw"
            elevation="2"
          >
            <v-card-title class="text-h6">
              <v-avatar class="avatar-background" size="x-large">
                <v-icon size="large" color="white">{{ info.icon }}</v-icon>
              </v-avatar>
            </v-card-title>

            <v-card-subtitle
              class="text-h3 mt-4 mb-4 font-weight-bold text-white opacity-100"
            >
              {{ info.value }}
            </v-card-subtitle>

            <v-card-subtitle class="text-h6 font-weight-light">{{
              info.title
            }}</v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.avatar-background {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
