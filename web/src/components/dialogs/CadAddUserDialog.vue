<script setup>
import { useUsersStore } from "@/stores/users.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import validator from "@/utils/validator";

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const form = ref(null);
const usersStore = useUsersStore();
const isLoading = ref(false);

const email = ref(null);
const selectedRole = ref(null);

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

const emit = defineEmits(["update:modelValue", "on-add-user"]);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const addUser = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) return;

  isLoading.value = true;

  try {
    const response = await usersStore.addUser(email.value, selectedRole.value);

    emit("on-add-user", {
      status: response.status,
      data: response.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Erro ao adiconar o usuário.",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = () => {
  if (form.value) {
    form.value.reset();
    form.value.resetValidation();
  }
  dialog.value = false;
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card
      title="Adcionar um usuário"
      subtitle="Adicione um novo usuário no Cadterreiros"
      :loading="isLoading"
    >
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Ao adicionar um novo usuário você deve escolher o tipo de usuário.
          Para usuários Web selecione a opção "Administrador" e para
          recenseadores selecione a opção "Recenseador". Usuários do tipo
          Adiministrador terão acesso a plataforma web e usuários Recenseadores
          terão acesso aos dados e poderão editar o cadastro a partir do app no
          smartphone.
        </p>
        <v-form ref="form" @submit.prevent="addUser">
          <v-text-field
            v-model="email"
            density="compact"
            variant="outlined"
            label="E-mail"
            name="email"
            type="email"
            class="mt-4"
            :rules="[validator.isRequired]"
          />
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
        <v-btn variant="text" @click="closeDialog" :disabled="isLoading">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :loading="isLoading"
          @click="addUser"
        >
          Adcionar usuário
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
