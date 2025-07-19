<script setup>
import validator from "@/utils/validator";
import cadComplete from "@/assets/svg/cad.complete.svg";
import { baseRoute } from "@/router/base";
import { useAuthStore } from "@/stores/auth.store";

const authStore = useAuthStore();
const navigate = useRouter();

const form = ref();
const userEmail = ref("renato.bonfim.jr@cciao.org");

const resetPassword = async () => {
  const isValid = await form.value.validate();
  if (!isValid) return;

  const response = await authStore.forgetPassword(userEmail.value);
  console.log(response);

  if (!response.status) {
    useSnackbarStore().showSnackbar({
      message: response.error,
      color: "red",
    });
  } else {
    navigate.push({
      name: baseRoute.otp,
      params: {
        token: response.data,
        email: userEmail.value,
      },
    });
  }
};
</script>

<template>
  <v-container class="mx-auto cad-container" max-width="60vh">
    <v-card
      class="d-flex flex-column h-100 pa-6 rounded-lg mt-4"
      color="grey-lighten-5"
      elevation="1"
    >
      <v-img class="mb-12" :src="cadComplete" height="120" />
      <v-form ref="form">
        <p>
          Informe o seu email para iniciar o processo de recuperação da senha.
        </p>
        <v-text-field
          v-model="userEmail"
          density="compact"
          variant="outlined"
          label="E-mail"
          name="email"
          type="email"
          class="mt-4"
          :rules="[validator.isRequired]"
        />

        <div class="d-flex flex-column justify-center mt-12">
          <v-btn
            class="bg-primary text-white"
            rounded="lg"
            size="large"
            text="Recuperar Senha"
            variant="outlined"
            prepend-icon="mdi-login"
            :disabled="!userEmail"
            @click="resetPassword"
          />
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
