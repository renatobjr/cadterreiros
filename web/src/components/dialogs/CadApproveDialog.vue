<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const props = defineProps({
  communityId: {
    type: String,
    required: false,
    default: null,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "on-approve"]);

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const isLoading = ref(false);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeDialog = () => {
  dialog.value = false;
};

const approveCensus = async () => {
  isLoading.value = true;
  try {
    const response = await religiousCommunitiesStore.approveCensus(
      props.communityId
    );

    emit("on-approve", {
      status: response.status,
      data: response.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Erro ao aprovar o cadastro da comunidade.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card title="Aprovar cadastramento" :loading="isLoading">
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Deseja realmente aprovar o cadastramento da comunidade?
          <br />Caso necessário você pode atribuir um novo status para a
          comunidade a qualquer momento.
        </p>

        <v-card-actions class="pa-6 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
            Cancelar
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            @click="approveCensus"
            :loading="isLoading"
            :disabled="isLoading"
          >
            Aprovar
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
