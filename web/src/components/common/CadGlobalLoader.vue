<script setup>
import cadLogo from "@/assets/svg/cad.color.svg";

defineProps({
  isLoading: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
  100% {
    opacity: 0.5;
    transform: scale(1);
  }
}
</style>

<template>
  <v-overlay :model-value="isLoading" class="align-center justify-center">
    <v-progress-circular
      color="bg-copper"
      size="64"
      indeterminate
    ></v-progress-circular>
  </v-overlay>
</template>
