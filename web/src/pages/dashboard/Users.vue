<script setup>
import { useUsersStore } from "@/stores/users.store";
import dayjs from "dayjs";
import { useSnackbarStore } from "@/stores/components/snackbar.store";

const userStore = useUsersStore();

const isLoading = ref(false);
const users = ref([]);

const showSetUserStatusDialog = ref(false);
const showChangeRoleDialog = ref(false);
const showAddUserDialog = ref(false);

const selectedCensusTaker = ref(null);
const selectedStatus = ref(null);

const searchParams = reactive({
  page: 1,
  itemsPerPage: 10,
  sortBy: [],
});

const headers = ref([
  {
    title: "Nome",
    key: "fullname",
    sortable: true,
    visible: true,
  },
  {
    title: "Email",
    key: "email",
    sortable: true,
    visible: true,
  },
  {
    title: "Permissão",
    key: "role",
    sortable: true,
    visible: true,
  },
  {
    title: "Status",
    key: "isEnabled",
    sortable: true,
    visible: true,
  },
  {
    title: "Último login",
    key: "lastLogin",
    sortable: true,
    visible: true,
  },
  { title: "Ações", key: "actions", sortable: false },
]);

const itemsPerPage = ref(10);
let totalItems = 0;

const initializeData = async () => {
  await userStore.listAll();
  await loadUsers(searchParams);
};

onMounted(async () => {
  await initializeData();
});

const loadUsers = async ({ page, itemsPerPage, sortBy }) => {
  isLoading.value = true;

  await userStore
    .fetchData({
      page,
      itemsPerPage,
      sortBy,
    })
    .then(({ items, total }) => {
      users.value = items;
      totalItems = total;
    });

  isLoading.value = false;
};

const setUserStatus = (userId, status) => {
  showSetUserStatusDialog.value = true;
  selectedCensusTaker.value = userId;
  selectedStatus.value = status;
};

const setUserRole = (userId) => {
  showChangeRoleDialog.value = true;
  selectedCensusTaker.value = userId;
};

const setAddUser = () => {
  showAddUserDialog.value = true;
};

const onSetUserStatus = async (data) => {
  if (data.status) {
    await userStore.listAll();

    await loadUsers({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
    });

    useSnackbarStore().showSnackbar({
      message: "Status do usuário alterado com sucesso!",
      color: "green",
    });

    selectedCensusTaker.value = null;
    selectedStatus.value = null;
  }
};

const onChangeUserRole = async (data) => {
  if (data.status) {
    await userStore.listAll();

    await loadUsers({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
    });

    useSnackbarStore().showSnackbar({
      message: "Permissão do usuário alterado com sucesso!",
      color: "green",
    });

    selectedCensusTaker.value = null;
  }
};

const onAddUser = async (data) => {
  if (data.status) {
    await userStore.listAll();

    await loadUsers({
      page: 1,
      itemsPerPage: itemsPerPage.value,
      sortBy: [],
    });

    useSnackbarStore().showSnackbar({
      message: "Usuário adicionado com sucesso!",
      color: "green",
    });
  } else {
    useSnackbarStore().showSnackbar({
      message: "Erro ao adicionar o usuário.",
      color: "red",
    });
  }
};

const setRole = (role) => {
  switch (role) {
    case "admin":
      return "Administrador";
    case "census_taker":
      return "Recenseador";
  }
};

const setEnabled = (isEnabled) => {
  switch (isEnabled) {
    case true:
      return {
        color: "success",
        text: "Ativo",
      };
    case false:
      return {
        color: "error",
        text: "Inativo",
      };
  }
};
</script>

<template>
  <v-container class="pa-10" fluid>
    <v-card class="d-flex flex-column h-100 pa-4 rounded-lg" elevation="1">
      <template #title>
        <div class="d-flex justify-space-between align-center w-100">
          <div>
            <div class="text-h6">Usuários</div>
            <div class="text-subtitle-2">
              Aqui você pode gerenciar os usuários cadastrados no Cadterreiros.
            </div>
          </div>
          <v-btn
            color="success"
            prepend-icon="mdi-account-plus"
            class="ml-4"
            @click="setAddUser"
          >
            Adicionar Usuário
          </v-btn>
        </div>
      </template>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        item-value="fullname"
        :items="users"
        :items-length="totalItems"
        :loading="isLoading"
        loading-text="Carregando..."
        no-data-text="Nenhum Usuário encontrado"
        multi-sort
        @update:options="loadUsers"
      >
        <template #item.role="{ item }">
          <v-chip color="primary" label>{{ setRole(item.role) }}</v-chip>
        </template>

        <template #item.isEnabled="{ item }">
          <v-chip :color="setEnabled(item.isEnabled).color" label>
            {{ setEnabled(item.isEnabled).text }}
          </v-chip>
        </template>

        <template #item.lastLogin="{ item }">
          {{ dayjs(item.lastLogin).format("DD/MM/YYYY") }}
        </template>

        <template #item.actions="{ item }">
          <v-tooltip text="Ativar Usuário" location="top">
            <template #activator="{ props }">
              <v-btn
                v-if="!item.isEnabled"
                v-bind="props"
                class="mr-2"
                size="small"
                color="green"
                variant="flat"
                @click="setUserStatus(item.id, true)"
              >
                <v-icon size="large">mdi-account-check</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Desativar Usuário" location="top">
            <template #activator="{ props }">
              <v-btn
                v-if="item.isEnabled"
                v-bind="props"
                class="mr-2"
                size="small"
                color="red"
                variant="flat"
                @click="setUserStatus(item.id, false)"
              >
                <v-icon size="large">mdi-account-off</v-icon>
              </v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Trocar cargo" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                class="mr-2"
                size="small"
                color="warning"
                variant="flat"
                @click="setUserRole(item.id)"
              >
                <v-icon size="large">mdi-account-convert</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-server>
    </v-card>

    <cad-set-user-status-dialog
      v-model="showSetUserStatusDialog"
      :user-id="selectedCensusTaker"
      :status="selectedStatus"
      @on-set-user-status="onSetUserStatus"
    />

    <cad-change-user-role-dialog
      v-model="showChangeRoleDialog"
      :user-id="selectedCensusTaker"
      :role="selectedRole"
      @on-change-user-role="onChangeUserRole"
    />

    <cad-add-user-dialog v-model="showAddUserDialog" @on-add-user="onAddUser" />
  </v-container>
</template>
