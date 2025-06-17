<script setup>
const share = [
  {
    icon: "mdi-facebook",
    color: "blue-darken-2",
  },
  {
    icon: "mdi-whatsapp",
    color: "green",
  },
  {
    icon: "mdi-twitter",
    color: "light-blue",
  },
];
</script>

<template>
  <div
    id="share"
    class="ml-4 d-flex justify-center justify-md-start mt-6 mb-10 ga-2"
  >
    <div v-for="item in share">
      <v-btn :color="item.color">
        <v-icon size="x-large">{{ item.icon }}</v-icon>
      </v-btn>
    </div>
  </div>
</template>
