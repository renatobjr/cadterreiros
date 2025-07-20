import { userService } from "@/services/users";
import { defineStore, acceptHMRUpdate } from "pinia";
import { ref } from "vue";

export const useUsersStore = defineStore("users", () => {
  const isLoading = ref(false);
  const usersList = ref([]);
  const totalUsers = ref(0);

  async function list() {
    isLoading.value = true;
    try {
      usersList.value = await userService.list();
    } finally {
      isLoading.value = false;
    }
  }

  async function listAll() {
    isLoading.value = true;
    try {
      usersList.value = await userService.listAll();
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchData({ page, itemsPerPage, sortBy }) {
    if (!usersList.value.length) {
      totalUsers.value = 0;
      return { items: [], total: 0 };
    }

    totalUsers.value = usersList.value.length;

    return new Promise((resolve) => {
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;

      let sorted = [...usersList.value];

      if (sortBy.length) {
        const { key: sortKey, order: sortOrder } = sortBy[0];

        sorted.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];

          if (sortOrder === "asc") {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }

      const paginated = sorted.slice(start, end);

      resolve({
        items: paginated,
        total: usersList.value.length
      });
    });
  }

  async function setUserStatus(status, id) {
    isLoading.value = true;
    try {
      return await userService.setUserStatus(status, id);
    } finally {
      isLoading.value = false;
    }
  }

  async function changeUserRole(id, role) {
    isLoading.value = true;
    try {
      return await userService.changeUserRole(id, role);
    } finally {
      isLoading.value = false;
    }
  }

  async function addUser(email, role) {
    isLoading.value = true;
    try {
      return await userService.addUser(email, role);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    usersList,
    totalUsers,
    list,
    listAll,
    fetchData,
    setUserStatus,
    changeUserRole,
    addUser
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
