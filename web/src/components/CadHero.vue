<script setup>
import hero from "@/assets/img/hero_alter.jpg";
import { baseRoute } from "@/router/base";
</script>

<template>
  <v-container fluid class="pa-0">
    <v-img
      :src="hero"
      cover
      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.7)"
      height="70vh"
      class="d-flex align-center justify-center"
    >
      <div class="w-100 w-md-50 text-center pa-4 mx-auto">
        <h1 class="text-h6 text-md-h3 font-weight-bold text-white mb-10">
          Cadastramento dos Terreiros da Região Metropolitana de João Pessoa
        </h1>

        <div class="text-h6 text-md-h6 text-white mb-10 font-weight-thin">
          Um projeto com o objetivo de fortalece as comunidades de matriz
          africana, promovendo a igualdade e preservando um valioso patrimônio
          cultural imaterial brasileiro. Realizado pela Casa de Cultura Ilê Asé
          D'Osoguian em parceira com a FUNJOPE/PB e PNUD.
        </div>

        <div class="d-flex ga-4 justify-center">
          <v-btn
            class="text-none"
            color="red"
            rounded="lg"
            text="Cadastro Voluntário"
            size="large"
            @click="$router.push({ name: baseRoute.communityRegister })"
          />

          <v-btn
            append-icon="mdi-chevron-right"
            class="text-none"
            flat
            rounded="lg"
            text="Saiba mais"
            size="large"
            variant="outlined"
            color="white"
            @click="$router.push({ name: baseRoute.aboutProject })"
          />
        </div>
      </div>
    </v-img>
  </v-container>
</template>
