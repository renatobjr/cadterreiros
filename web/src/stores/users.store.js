import { userService } from "@/services/users";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useUsersStore = defineStore("users", () => {
  let usersList = ref([])
  let totalUsers = ref(0)

  async function list() {
    usersList.value = await userService.list();
  }

  async function listAll() {
    usersList.value = await userService.listAll();
  }

  async function fetchData({
    page,
    itemsPerPage,
    sortBy
  }) {
    if (usersList) {
      totalUsers.value = usersList.value.length;
    }

    return new Promise((resolve) => {
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;

      if (sortBy.length) {
        const sortKey = sortBy[0].key;
        const sortOrder = sortBy[0].order;

        usersList.value.sort((a, b) => {
          const aValue = a[sortKey];
          const bValue = b[sortKey];

          if (sortOrder === "asc") {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
          } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
          }
        });
      }

      const paginated = usersList.value.slice(start, end);

      resolve({
        items: paginated,
        total: usersList.value.length
      })
    })
  }

  async function setUserStatus(status, id) {
    return await userService.setUserStatus(status, id);
  }

  async function changeUserRole(id, role) {
    return await userService.changeUserRole(id, role);
  }

  async function addUser(email, role) {
    return await userService.addUser(email, role);
  }

  return {
    usersList,

    list,
    listAll,
    fetchData,
    setUserStatus,
    changeUserRole,
    addUser
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUsersStore, import.meta.hot));
}
