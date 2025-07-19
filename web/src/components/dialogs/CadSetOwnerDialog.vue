<script setup>
import { computed, ref, onMounted, watch } from "vue";
import validator from "@/utils/validator";
import { useUsersStore } from "@/stores/users.store";
import { useReligiousCommunitiesStore } from "@/stores/religiousCommunities.store";
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

const emit = defineEmits(["update:modelValue", "on-owner-assigned"]);

const usersStore = useUsersStore();
const religiousCommunitiesStore = useReligiousCommunitiesStore();

const form = ref(null);
const listUsers = ref([]);
const isLoading = ref(false);
const selectedCensusTaker = ref(null);
const keepStatus = ref(false);

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

const assignOwner = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    const response = await religiousCommunitiesStore.assignOwner(
      props.communityId,
      selectedCensusTaker.value,
      keepStatus.value
    );

    emit("on-owner-assigned", {
      status: response.status,
      data: response.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Erro ao atribuir recenseador.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  await usersStore.list();
  listUsers.value = usersStore.usersList;
  isLoading.value = false;
});
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      title="Atribuir Recenseador a Comunidade"
      subtitle="Atribua um recenseador para permitir a edição dos dados da comunidade"
      :loading="isLoading"
    >
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Ao selecionar um novo recenseador para a comunidade, ele passará a ter
          acesso aos dados e poderá editar o cadastro. Você pode marcar a opção
          de "Manter o Status" se quiser que o cadastro seja mantido no status
          atual.
        </p>
        <v-form ref="form" @submit.prevent="assignOwner">
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
          ></v-select>
          <v-checkbox
            v-model="keepStatus"
            label="Não modificar o status da comunidade"
            :disabled="isLoading"
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
          variant="flat"
          @click="assignOwner"
          :loading="isLoading"
        >
          Atribuir Recenseador
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
