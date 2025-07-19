<script setup>
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { useUsersStore } from "@/stores/users.store";
import validator from "@/utils/validator";

const props = defineProps({
  userId: {
    type: String,
    required: true,
    default: null,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const listPermissions = [
  {
    value: "admin",
    title: "Administrador",
  },
  {
    value: "census_taker",
    title: "Recenseador",
  },
];

const form = ref(null);
const selectedRole = ref(null);
const userStore = useUsersStore();
const isLoading = ref(false);

const emit = defineEmits(["update:modelValue", "on-change-user-role"]);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const changeUserRole = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    const response = await userStore.changeUserRole(
      props.userId,
      selectedRole.value
    );

    emit("on-change-user-role", {
      status: response.status,
      data: response.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Erro ao alterar permissão do usuário.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
  if (form.value) {
    form.value.reset();
    form.value.resetValidation();
    selectedCensusTaker.value = null;
  }
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card title="Alterar Permissão" :loading="isLoading">
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Deseja realmente alterar a permissão do usuário?
        </p>

        <v-form ref="form" @submit.prevent="changeUserRole">
          <v-select
            v-model="selectedRole"
            density="compact"
            variant="outlined"
            label="Selecione a nova permissão"
            :items="listPermissions"
            :rules="[validator.isRequired]"
            :disabled="isLoading"
          ></v-select>
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
          :loading="isLoading"
          :disabled="isLoading"
          @click="changeUserRole"
        >
          Alterar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
