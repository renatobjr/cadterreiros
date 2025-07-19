<script setup>
import cadLogo from "@/assets/svg/cad.logo.svg";
import { useAuthStore } from "@/stores/auth.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";
import { baseRoute } from "@/router/base";
import { authRoute } from "@/router/auth";

const router = useRouter();

const authStore = useAuthStore();
const username = ref(null);
const email = ref(null);

const snackbarStore = useSnackbarStore();
const { snackbar } = storeToRefs(snackbarStore);

const logout = () => {
  authStore.logout();
  router.push({ name: baseRoute.index });
};

onMounted(() => {
  const user = authStore.user;
  username.value = user.fullname;
  email.value = user.email;
});
</script>

<template>
  <v-app>
    <v-snackbar
      v-model="snackbar.show"
      class="elevation-15"
      location="top"
      :color="snackbar.color"
    >
      <span>{{ snackbar.message }}</span>
    </v-snackbar>

    <v-layout>
      <v-navigation-drawer expand-on-hover rail>
        <v-list>
          <v-list-item
            :prepend-avatar="cadLogo"
            :subtitle="email"
            :title="username"
            @click="$router.push({ name: authRoute.dashboard })"
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-account-multiple"
            title="Gestão de Usuários"
            value="users"
            @click="$router.push({ name: authRoute.users })"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-account"
            title="Perfil"
            value="profile"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            value="logout"
            @click="logout"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-app>
</template>
