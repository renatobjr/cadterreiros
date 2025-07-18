<script setup>
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { storeToRefs } from "pinia";

const snackbarStore = useSnackbarStore();
const { snackbar } = storeToRefs(snackbarStore);
</script>

<template>
  <v-app>
    <v-snackbar
      v-model="snackbar.show"
      class="elevation-15"
      location="top"
      :color="snackbar.color"
    >
      <span>{{ snackbar.message }}</span>
    </v-snackbar>
    <slot />
  </v-app>
</template>
