import { useAuthStore } from "~/stores/authStore";

export default defineNuxtRouteMiddleware(() => {
  const authStore = useAuthStore();
  if (!import.meta.client) {
    return;
  }

  const token = localStorage.getItem("auth_token");

  if (!token) {
    authStore.token = null;
    authStore.user = null;
    authStore.error = null;

    return navigateTo("/login", { replace: true });
  }

  authStore.token = token;
});
