<script setup>
import cadComplete from "@/assets/svg/cad.complete.svg";
import { baseRoute } from "@/router/base";
import { useAuthStore } from "@/stores/auth.store";
import validator from "@/utils/validator";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const authStore = useAuthStore();

const navigate = useRouter();

const route = useRoute();
const token = route.params.token;

const form = ref();
const setPasswordData = reactive({
  password: "",
  repeatPassword: "",
});

const setPassword = async () => {
  const isValid = await form.value.validate();
  if (!isValid) return;

  const response = await authStore.setPassword(token, setPasswordData.password);
  console.log(response);

  if (!response.status) {
    useSnackbarStore().showSnackbar({
      message: response.error,
      color: "red",
    });
  } else {
    useSnackbarStore().showSnackbar({
      message: "Senha atualizada com sucesso!",
      color: "green",
    });
    navigate.push({
      name: baseRoute.login,
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
      <v-img class="mb-12" :src="cadComplete" height="120" />
      <v-form ref="form">
        <v-text-field
          v-model="setPasswordData.password"
          density="compact"
          variant="outlined"
          label="Senha"
          name="passwordteste"
          type="password"
          class="mt-4"
          :rules="[validator.isRequired]"
        />
        <v-text-field
          v-model="setPasswordData.repeatPassword"
          density="compact"
          variant="outlined"
          label="Repita a senha"
          name="repeatPassword"
          type="password"
          class="mt-4"
          :rules="[
            validator.isRequired,
            validator.isMathcing(
              setPasswordData.password,
              setPasswordData.repeatPassword
            ),
          ]"
        />

        <div class="d-flex flex-column justify-center mt-12">
          <v-btn
            class="bg-primary text-white"
            rounded="lg"
            size="large"
            text="Atualizar Senha"
            variant="outlined"
            prepend-icon="mdi-login"
            @click="setPassword"
          />
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
