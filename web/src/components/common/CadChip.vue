<script setup>
import { setChipColor } from "@/utils/setChipColor";

defineProps({
  community: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <v-chip
    label
    class="text-capitalize mr-2"
    variant="flat"
    :color="setChipColor(community)"
  >
    {{ community }}
  </v-chip>
</template>
