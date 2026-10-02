<script setup>
import { ref, watch } from "vue";
import { searchAddress } from "@/utils/geocoding";

const search = defineModel("search", { type: String, default: "" });

const props = defineProps({
  latitude: {
    type: Number,
    default: null,
  },
  longitude: {
    type: Number,
    default: null,
  },
});

const emit = defineEmits(["select"]);

const selected = ref(null);
const suggestions = ref([]);
const isLoading = ref(false);

let debounceTimer = null;
let requestId = 0;
let selectedLabel = "";

const fetchSuggestions = async (query) => {
  const currentRequest = ++requestId;
  isLoading.value = true;

  try {
    const addresses = await searchAddress(query, {
      lat: props.latitude,
      lng: props.longitude,
    });

    if (currentRequest === requestId) suggestions.value = addresses;
  } catch (error) {
    console.error("[CadAddressAutocomplete]", error);
    if (currentRequest === requestId) suggestions.value = [];
  } finally {
    if (currentRequest === requestId) isLoading.value = false;
  }
};

watch(search, (value) => {
  const query = (value || "").trim();

  clearTimeout(debounceTimer);
  requestId += 1;

  if (query === selectedLabel || query.length < 3) {
    selectedLabel = "";
    suggestions.value = [];
    return;
  }

  debounceTimer = setTimeout(() => fetchSuggestions(query), 300);
});

watch(selected, (address) => {
  if (!address) return;

  selectedLabel = address.fullAddress;
  search.value = address.fullAddress;
  emit("select", address);
});
</script>

<template>
  <v-autocomplete
    v-model="selected"
    v-model:search="search"
    :items="suggestions"
    item-title="fullAddress"
    :loading="isLoading"
    label="Digite o endereço"
    density="compact"
    variant="outlined"
    clearable
    rounded="lg"
    color="sealbronw"
    hide-no-data
    no-data-text="Nenhum endereço encontrado"
    placeholder="Rua, bairro, cidade..."
    return-object
  />
</template>
