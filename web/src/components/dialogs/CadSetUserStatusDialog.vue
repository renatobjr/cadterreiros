<script setup>
import { useUsersStore } from "@/stores/users.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const props = defineProps({
  userId: {
    type: String,
    required: true,
    default: null,
  },
  status: {
    type: String,
    required: true,
    default: null,
  },
  modelValue: {
    type: Boolean,
    required: true,
  },
});

const userStore = useUsersStore();
const isLoading = ref(false);

const emit = defineEmits(["update:modelValue", "on-set-user-status"]);

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const setUserStatus = async () => {
  isLoading.value = true;

  try {
    const response = await userStore.setUserStatus(props.userId, props.status);

    emit("on-set-user-status", {
      status: response.status,
      data: response.data,
    });

    closeDialog();
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: "Não foi possível alterar o status do usuário",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const closeDialog = () => {
  dialog.value = false;
};

watch(dialog, (newValue) => {
  if (!newValue) {
    setTimeout(() => {
      if (form.value) {
        form.value.reset();
        form.value.resetValidation();
        selectedCensusTaker.value = null;
      }
    }, 300);
  }
});
</script>

<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card title="Aprovar cadastramento" :loading="isLoading">
      <v-card-text class="pt-8">
        <p class="text-body-1 font-weight-regular mb-10">
          Deseja realmente alterar o Status do usuário?
        </p>
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
          @click="setUserStatus"
        >
          Alterar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
