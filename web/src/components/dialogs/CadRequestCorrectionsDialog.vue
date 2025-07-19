<script setup>
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
import { useUsersStore } from "@/stores/users.store";
import validator from "@/utils/validator";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

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

const emit = defineEmits(["update:modelValue", "on-request-corrections"]);

const usersStore = useUsersStore();
const religiousCommunitiesStore = useReligiousCommunitiesStore();

const form = ref(null);
const listUsers = ref([]);
const isLoading = ref(false);
const selectedCensusTaker = ref(null);
const rejectedReason = ref("");

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

const setRequestCorrections = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    const reponse = await religiousCommunitiesStore.requestCorrections(
      props.communityId,
      selectedCensusTaker.value,
      rejectedReason.value
    );

    emit("on-request-corrections", {
      status: reponse.status,
      data: reponse.data,
    });

    closeDialog();
  } catch (error) {
    console.log(error);
    useSnackbarStore().showSnackbar({
      message: "Erro ao requisitar revisão.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  await usersStore.list();
  listUsers.value = usersStore.listUsers;
  isLoading.value = false;
});
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      title="Solicitar Revisão"
      subtitle="Atribua um recenseador para corrigir os dados da comunidade"
      :loading="isLoading"
    >
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Ao requisitar a revisão e correção dos dados da comunidade, o
          recenseador selecionado terá acesso aos dados e poderá corrigir os
          erros. O status da comunidade será alterado para 'Reijeitada',
          exigindo uma nova revisão e aprovação.
        </p>
        <v-form ref="form" @submit.prevent="setRequestCorrections">
          <v-select
            v-model="selectedCensusTaker"
            density="compact"
            variant="outlined"
            label="Selecione o Recenseador"
            :items="listUsers"
            item-title="fullname"
            item-value="id"
            :rules="[validator.isRequired]"
            :disabled="isLoading"
          />
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

          <v-card-actions class="pa-6 pt-0">
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              @click="setRequestCorrections"
              variant="flat"
              :loading="isLoading"
            >
              Solictar Correções
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
