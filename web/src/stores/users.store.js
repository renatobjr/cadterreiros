import { userService } from "@/services/users";
import { defineStore, acceptHMRUpdate } from "pinia";

export const useUsersStore = defineStore("users", () => {
  const listUsers = ref([])

  async function list() {
    listUsers.value = await userService.list();
  }

  return {
    listUsers,

    list
  }
});
