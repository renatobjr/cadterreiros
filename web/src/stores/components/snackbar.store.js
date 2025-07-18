import { defineStore } from "pinia";

export const useSnackbarStore = defineStore("snackbar", () => {
  const snackbar = reactive({
    show: false,
    message: "",
    color: "green",
  });

  const showSnackbar = ({ message, color }) => {
    snackbar.show = true;
    snackbar.message = message;
    snackbar.color = color;
  };

  return {
    snackbar,
    showSnackbar,
  };
});
