<script setup>
import cadLogo from "@/assets/svg/cad.logo.svg";
import { baseRoute } from "@/router/base";

const links = [
  {
    title: "Inicio",
    router: baseRoute.index,
  },
  {
    title: "Buscar um Terreiro",
    router: baseRoute.search,
  },
];
</script>

<template>
  <v-app-bar elevation="1" height="82">
    <v-container
      class="mx-auto d-flex align-center justify-space-between"
      max-width="100%"
    >
      <div id="img_header">
        <a href="/">
          <v-img :src="cadLogo" height="48" width="48" />
        </a>
      </div>

      <v-space></v-space>

      <div id="nav" class="d-flex align-center">
        <v-btn
          class="justify-center"
          v-for="link in links"
          :key="link"
          :text="link.title"
          @click="$router.push({ name: link.router })"
          variant="text"
        ></v-btn>
        <v-btn
          class="justify-center"
          key="login"
          text="login"
          variant="tonal"
        ></v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>
