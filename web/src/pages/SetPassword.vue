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
const isLoading = ref(false);
const isFromForget = ref(true);
const setPasswordData = reactive({
  fullname: undefined,
  password: "",
  repeatPassword: "",
});

const setPassword = async () => {
  const isValid = await form.value.validate();
  if (!isValid) return;

  isLoading.value = true;

  try {
    const response = await authStore.setPassword(
      token,
      setPasswordData.password,
      setPasswordData.fullname
    );

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
  } catch (error) {
    useSnackbarStore().showSnackbar({
      message: response.error,
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  const state = history.state;
  if (state) {
    isFromForget.value = state.isFromForget;
  }
});
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
        <p class="text-h6 font-weight-bold text-center">
          {{ isFromForget ? "Recuperar Senha" : "Criar Senha" }}
        </p>
        <v-text-field
          v-if="!isFromForget"
          v-model="setPasswordData.fullname"
          density="compact"
          variant="outlined"
          label="Nome completo"
          name="fullname"
          type="text"
          class="mt-4"
          :rules="[validator.isRequired]"
        />
        <v-text-field
          v-model="setPasswordData.password"
          density="compact"
          variant="outlined"
          label="Senha"
          name="password"
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
            :text="isFromForget ? 'Recuperar Senha' : 'Criar Senha'"
            variant="outlined"
            prepend-icon="mdi-login"
            @click="setPassword"
          />
        </div>
      </v-form>
    </v-card>
  </v-container>
</template>
