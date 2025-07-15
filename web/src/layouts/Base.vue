<script setup>
import DefaultView from "./Default.vue";
</script>

<template>
  <default-view>
    <cad-nav />
    <v-main>
      <slot />
    </v-main>
    <cad-footer />
  </default-view>
</template>
