<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div id="emphasis">
    <h2 class="text-h4 pa-4">{{ title }}</h2>
    <p class="emphasis mb-4 pa-4">
      {{ text }}
    </p>
  </div>
</template>

<style scope>
.emphasis {
  margin-left: 16px;
  border-left: 4px solid #1976d2;
}
</style>
