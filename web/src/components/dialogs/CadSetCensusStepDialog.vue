<script setup>
import { ECensusStep } from "@/enum/ECensusStep";
import validator from "@/utils/validator";
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";

const props = defineProps({
  communityId: {
    type: String,
    required: true,
    default: null,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "on-census-step-assigned"]);

const religiousCommunitiesStore = useReligiousCommunitiesStore();

const isLoading = ref(false);
const form = ref(null);
const selectedCensusStep = ref(null);
const rejectedReason = ref('');

const listCensusSteps = [
  {
    title: "Pendente",
    value: ECensusStep.PENDING,
  },
  {
    title: "Rejeitado",
    value: ECensusStep.REJECTED,
  },
  {
    title: "Aprovado",
    value: ECensusStep.APPROVED,
  },
];

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeDialog = () => {
  dialog.value = false;
};

watch(dialog, (newValue) => {
  if (!newValue) {
    setTimeout(() => {
      if (form.value) {
        form.value.reset();
        form.value.resetValidation();
      }
    }, 300);
  }
});

const setCensusStep = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    const reponse = await religiousCommunitiesStore.setCensusStep(
      props.communityId,
      selectedCensusStep.value,
      rejectedReason.value
    );

    emit("on-census-step-assigned", {
      status: reponse.status,
      data: reponse.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Erro ao mudar o status da comunidade.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      title="Atribuir novo Status"
      subtitle="Atribua um novo status a uma comunidade"
      :loading="isLoading"
    >
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-8">
          Defina os status para a comunidade (Pendente, Aprovado ou Rejeitado).
          Ao passar o mouse sobre os status, eles serão explicados.

          <div class="mt-4">
            <v-tooltip
              text="Este é o status padrão de um nova comunidade."
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-chip v-bind:="props" class="ma-2" color="warning" label>
                  Pendente
                </v-chip>
              </template>
            </v-tooltip>

            <v-tooltip
              text="Após a revisão dos dados, caso haja alguma inconsistência, você
                pode rejeitar e o recenseador deve corrigir as pendências."
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-chip v-bind:="props" class="ma-2" color="error" label>
                  Rejeitado
                </v-chip>
              </template>
            </v-tooltip>

            <v-tooltip
              text="Após a revisão dos dados e aprovação da
                comunidade, ela a ser exibida no mapa e no site."
              location="top"
            >
              <template v-slot:activator="{ props }">
                <v-chip v-bind:="props" class="ma-2" color="success" label>
                  Aprovado
                </v-chip>
              </template>
            </v-tooltip>
          </div>
        </p>

        <v-form ref="form" @submit.prevent="setCensusStep">
          <v-select
            v-model="selectedCensusStep"
            density="compact"
            variant="outlined"
            label="Selecione o Status"
            :items="listCensusSteps"
            item-title="title"
            item-value="value"
            :disabled="isLoading"
            :rules="[validator.isRequired]"
          />
          <v-textarea
            v-if="selectedCensusStep === ECensusStep.REJECTED"
            v-model="rejectedReason"
            class="mb-8"
            density="compact"
            variant="outlined"
            label="Motivo da Rejeição"
            hide-details
            single-line
            clearable
            :disabled="isLoading"
            :rules="[validator.isRequired]"
          />

          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
              Cancelar
            </v-btn>
            <v-btn color="primary" @click="setCensusStep"  variant="flat" :loading="isLoading">
              Atribuir Status
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
