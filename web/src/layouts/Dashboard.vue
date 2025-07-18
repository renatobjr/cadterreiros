<script setup>
import cadLogo from "@/assets/svg/cad.logo.svg";
import { useAuthStore } from "@/stores/auth.store";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const authStore = useAuthStore();
const username = ref(null);
const email = ref(null);

const snackbarStore = useSnackbarStore();
const { snackbar } = storeToRefs(snackbarStore);

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
          ></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-account-multiple"
            title="Perfil"
            value="profile"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-logout"
            title="Logout"
            value="logout"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-app>
</template>
