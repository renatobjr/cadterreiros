<script setup>
import router from "@/router";
import validator from "@/utils/validator";
import cadComplete from "@/assets/svg/cad.complete.svg";
import { baseRoute } from "@/router/base";
import { useAuthStore } from "@/stores/auth.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { authRoute } from "@/router/auth";

const navigate = useRouter();
const isLoading = ref(false);

const form = ref();
const loginForm = reactive({
  email: "belatuca@hotmail.com",
  password: "test.password",
});

const login = async () => {
  const isValid = await form.value.validate();
  if (!isValid) return;

  isLoading.value = true;

  try {
    const response = await useAuthStore().login(loginForm);

    if (!response.status) {
      useSnackbarStore().showSnackbar({
        message: response.error,
        color: "red",
      });
    } else {
      navigate.push({ name: authRoute.dashboard });
    }
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: response.error,
      color: "red",
    });
  } finally {
    isLoading.value = false;
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
        <v-text-field
          v-model="loginForm.email"
          density="compact"
          variant="outlined"
          label="E-mail"
          name="email"
          type="email"
          class="mt-4"
          :rules="[validator.isRequired]"
        />
        <v-text-field
          v-model="loginForm.password"
          density="compact"
          variant="outlined"
          label="Senha"
          name="password"
          type="password"
          class="mt-2"
          :rules="[validator.isRequired]"
        />
        <div class="d-flex flex-column justify-center mt-12">
          <v-btn
            class="bg-primary text-white"
            rounded="lg"
            size="large"
            text="Login"
            variant="outlined"
            :loading="isLoading"
            @click="login"
          />
          <v-btn
            class="bg-red text-white mt-2"
            rounded="lg"
            size="large"
            text="Esquici minha senha"
            variant="outlined"
            @click="
              router.push({
                name: baseRoute.fogetPassword,
                state: { isFromForget: true },
              })
            "
          />
          <v-btn
            class="bg-warning text-white mt-2"
            rounded="lg"
            size="large"
            text="Primeiro Acesso"
            variant="outlined"
            @click="
              router.push({
                name: baseRoute.firstAccess,
                state: { isFromForget: false },
              })
            "
          />
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
