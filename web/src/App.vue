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

<style>
/* Google Autocomplete estilizado com Vuetify-like e fonte Nunito Sans */
.pac-container {
  z-index: 999999 !important;
  background-color: #ffffff !important;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1), 0px 6px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  font-family: "Nunito Sans", sans-serif;
  font-size: 16px;
}

.pac-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  font-size: 16px;
  line-height: 22px;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: background-color 0.2s ease;
  background-color: #ffffff !important;
}

.pac-item:last-child {
  border-bottom: none;
}

.pac-item:hover,
.pac-item-selected {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

/* Ícone de marcador removido */
.pac-icon {
  display: none !important;
}

.pac-item-query {
  font-weight: 600;
  color: var(--v-theme-primary, #1976d2);
  font-size: 16px;
}

.pac-item span:not(.pac-item-query) {
  color: var(--v-theme-on-surface, rgba(0, 0, 0, 0.87));
  font-size: 16px;
}

/* "powered by Google" oculto */
.pac-controls {
  display: none !important;
}
</style>
