<script lang="ts" setup>
import { computed, onBeforeMount } from "vue";
import Base from "./layouts/Base.vue";
import Dashboard from "./layouts/Dashboard.vue";
import { RouteLocationNormalizedLoaded } from "vue-router";

let route: RouteLocationNormalizedLoaded;
onBeforeMount(() => {
  route = useRoute();
});

const layout = computed(() => {
  const currentLayout = Base;
  if (route.meta.layout === "authenticated") {
    return Dashboard;
  }

  return currentLayout;
});
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
