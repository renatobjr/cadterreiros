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
      variant="tonal"
      location="top"
      :color="snackbar.color"
    >
      <span>{{ snackbar.message }}</span>

      <template v-slot:actions>
        <v-btn color="primary" flat @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
    <slot />
  </v-app>
</template>
