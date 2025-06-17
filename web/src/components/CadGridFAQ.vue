<script setup>
import { baseRoute } from "@/router/base";
import gridFirst from "@/assets/img/grid_01.jpg";
import gridSecond from "@/assets/img/grid_02.jpg";
import gridThird from "@/assets/img/grid_03.jpg";

const grids = [
  {
    image: gridFirst,
    title: "O que são Comunidades Tradicionais?",
    link: baseRoute.gridFAQTraditionalCommunities,
  },
  {
    image: gridSecond,
    title: "Quais as linguagens do Candomblé?",
    link: baseRoute.gridFAQLanguages,
  },
  {
    image: gridThird,
    title: "Quais as nações do Candomblé no Brasil?",
    link: baseRoute.gridFAQNations,
  },
];
</script>

<template>
  <div class="d-flex justify-center">
    <v-container class="mx-auto cad-container" max-width="160vh">
      <p class="text-h4 text-md-h4 font-weight-bold text-black mb-2">
        Uma luta contra a exclusão e a intolerância religiosa
      </p>
      <p class="text-h6 text-md-h5 font-weight-thin text-black mb-10">
        Leia nossos artigos para entender mais sobre o Candomblé e as Religiões
        de Matriz Africana no Brasil
      </p>
      <v-row class="mt-10">
        <v-col cols="4" v-for="grid in grids" :key="grid">
          <v-img
            :src="grid.image"
            cover
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="50vh"
            width="50vh"
            class="rounded-lg d-flex justify-center align-center"
          >
            <div class="w-100 w-md-80 text-center pa-4 mx-auto">
              <h1 class="text-img text-h4 font-weight-bold text-white mb-4">
                {{ grid.title }}
              </h1>

              <div class="d-flex ga-4 justify-center">
                <v-btn
                  append-icon="mdi-chevron-right"
                  class="text-none"
                  flat
                  rounded="lg"
                  text="Saiba mais"
                  size="large"
                  variant="outlined"
                  color="white"
                  @click="$router.push({ name: grid.link })"
                />
              </div>
            </div>
          </v-img>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.text-img {
  margin-top: 20vh;
}
</style>
