<script setup>
import { computed, onBeforeMount } from "vue";
import Default from "./layouts/default.vue";

let route;

onBeforeMount(() => {
  route = useRoute();
});

const layout = computed(() => {
  const layout = Default;
  return layout;
});
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
