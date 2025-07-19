<script setup>
import validator from "@/utils/validator";
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";

const props = defineProps({
  communityId: {
    type: String || null,
    required: false,
    default: null,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "on-reject"]);

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const form = ref(null);
const rejectedReason = ref("");
const isLoading = ref(false);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeDialog = () => {
  if (form.value) {
    form.value.reset();
    form.value.resetValidation();
    selectedCensusTaker.value = null;
  }
  dialog.value = false;
};

const rejectCensus = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    const response = await religiousCommunitiesStore.rejectCensus(
      props.communityId,
      rejectedReason.value
    );

    emit("on-reject", {
      status: response.status,
      data: response.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Erro ao rejeitar o cadastro.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      title="Rejeitar e solicitar revisão"
      subtitle="Solicite a revisão do cadastro da comunidade para o recenseador"
      :loading="isLoading"
    >
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Ao rejeitar e solictar uma revisão o recenseador deve corrigir as
          inconsistências encontradas. Não esqueça de informar o motivo da
          rejeição, seja claro no seu comentário.<br />
          Por exemplo: "A foto não corresponse a uma fachada"
        </p>
        <v-form ref="form" @submit.prevent="rejectCensus">
          <v-textarea
            v-model="rejectedReason"
            class="mt-2 mb-8"
            density="compact"
            variant="outlined"
            label="Motivo do pedido de correção"
            hide-details
            single-line
            clearable
            :disabled="isLoading"
            :rules="[validator.isRequired]"
          />
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          @click="rejectCensus"
          variant="flat"
          :loading="isLoading"
        >
          Rejeitar e solicitar revisão
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
