import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("authStore", () => {
  const token = ref(null);
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });
      const newToken = response?.data?.sessions?.[0]?.token;
      if (!newToken) {
        throw new Error("Token tidak ditemukan dari response login");
      }

      token.value = newToken;
      localStorage.setItem("auth_token", newToken);
      return response;
    } catch (err) {
      error.value = err?.data?.message || err?.message || "Login gagal";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;

    localStorage.removeItem("auth_token");
  };

  return {
    token,
    user,
    loading,
    error,
    login,
    logout,
  };
});
