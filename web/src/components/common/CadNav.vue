<script setup>
import cadLogo from "@/assets/svg/cad.logo.svg";
import { baseRoute } from "@/router/base";

const links = [
  {
    title: "Buscar um Terreiro",
    router: baseRoute.search,
  },
  {
    title: "Cadastrar um terreiro",
    router: baseRoute.communityRegister,
  },
  {
    title: "Sobre a CCIAO",
    router: baseRoute.aboutCCIAO,
  },
];
</script>

<template>
  <v-app-bar class="elevation-2" height="82">
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
      </div>

      <!-- <v-space></v-space>

      <div id="login_btn">
        <v-btn
          class="text-none"
          color="red"
          rounded="lg"
          text="Login"
          size="large"
        />
      </div> -->
    </v-container>
  </v-app-bar>
</template>
