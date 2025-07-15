import { defineStore } from "pinia";

export const useSnackbarStore = defineStore("snackbar", () => {
  const snackbar = reactive({
    show: false,
    message: "",
    type: "success",
  });

  const showSnackbar = ({ message, type }: any) => {
    snackbar.show = true;
    snackbar.message = message;
    snackbar.type = type;
  };

  return {
    snackbar,
    showSnackbar,
  };
});
