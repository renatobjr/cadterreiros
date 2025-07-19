<script setup>
import validator from "@/utils/validator";
import cadComplete from "@/assets/svg/cad.complete.svg";
import { baseRoute } from "@/router/base";
import { useAuthStore } from "@/stores/auth.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const authStore = useAuthStore();
const navigate = useRouter();

const form = ref();
const userEmail = ref("renato.bonfim.jr@cciao.org");

const isFromForget = ref(true);

onMounted(() => {
  const state = history.state;
  if (state) {
    isFromForget.value = state.isFromForget;
  }
});

const setEmail = async () => {
  const isValid = await form.value.validate();
  if (!isValid) return;

  const response = await authStore.generateUserToken(
    userEmail.value,
    isFromForget.value
  );

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
      class="d-flex flex-column h-100 pa-6 rounded-lg mt-4"
      color="grey-lighten-5"
      elevation="1"
    >
      <v-img class="mb-12" :src="cadComplete" height="120" />
      <v-form ref="form">
        <p v-if="isFromForget">
          Informe o seu email para iniciar o processo de recuperação da senha.
        </p>
        <p v-else>
          Informe o seu email de cadastro para iniciar o processo para
          configuração de sua senha.
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
            :text="isFromForget ? 'Recuperar Senha' : 'Cadastrar Senha'"
            variant="outlined"
            prepend-icon="mdi-login"
            :disabled="!userEmail"
            @click="setEmail"
          />
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
