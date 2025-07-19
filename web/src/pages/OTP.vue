<script setup>
import { baseRoute } from "@/router/base";
import { useAuthStore } from "@/stores/auth.store";
import { useRoute } from "vue-router";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const authStore = useAuthStore();
const navigate = useRouter();

const route = useRoute();
const otp = ref("");
const isFromForget = ref(true);

onMounted(() => {
  const state = history.state;
  if (state) {
    isFromForget.value = state.isFromForget;
  }
});

const token = route.params.token;
const userEmail = route.params.email;

const verifyOTP = async () => {
  const response = await authStore.verifyOTP(token, otp.value);

  if (!response.status) {
    useSnackbarStore().showSnackbar({
      message: response.error,
      color: "red",
    });
  } else {
    navigate.push({
      name: baseRoute.setPassword,
      params: { token },
      state: {
        isFromForget: isFromForget.value,
      },
    });
  }
};
</script>

<template>
  <v-container class="mx-auto cad-container" max-width="60vh">
    <v-card
      class="py-8 px-6 text-center mx-auto ma-4"
      elevation="1"
      max-width="400"
      width="100%"
    >
      <h3 class="text-h6 mb-4">Verifique seu email</h3>

      <div class="text-body-2">
        Enviamos para o email {{ userEmail }} o código de verificação <br />
        Por favor verifique e cole o código.
      </div>

      <v-sheet color="surface">
        <v-otp-input v-model="otp" type="password" variant="solo"></v-otp-input>
      </v-sheet>

      <v-btn
        class="my-4"
        color="primary"
        height="40"
        text="Verificar Código"
        variant="flat"
        width="70%"
        error
        :disabled="otp.length < 6"
        @click="verifyOTP"
      />
    </v-card>
  </v-container>
</template>
