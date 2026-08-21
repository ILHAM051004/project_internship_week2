import { useAuthStore } from "~/stores/authStore";

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();

  if (!import.meta.client) {
    return;
  }

  const token = localStorage.getItem("auth_token");

  if (token) {
    authStore.token = token;
  }

  if (!authStore.token) {
    return navigateTo("/login");
  }
});
