import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("authStore", () => {
  const token = ref(null);
  const user = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const config = useRuntimeConfig();

  if (import.meta.client) {
    token.value = localStorage.getItem("auth_token");
  }

  const login = async (email, password) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/auth/login", {
        baseURL: config.public.apiBase,
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: {
          email,
          password,
        },
      });

      const newToken = response?.data?.token;
      if (!newToken) {
        throw new Error("Token tidak ditemukan dari response login");
      }

      token.value = newToken;
      user.value = response?.data ?? null;

      if (import.meta.client) {
        localStorage.setItem("auth_token", newToken);
      }
      return response;
    } catch (err) {
      error.value = err?.data?.message || err?.message || "Login gagal";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getProfile = async () => {
    if (import.meta.client && !token.value) {
      token.value = localStorage.getItem("auth_token");
    }

    if (!token.value) {
      error.value = "Belum login";
      throw new Error("Belum login");
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await $fetch("/auth/profile", {
        baseURL: config.public.apiBase,
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.value}`,
        },
      });

      user.value = response?.data ?? response;
      return response;
    } catch (err) {
      error.value =
        err?.data?.message || err?.message || "Gagal mengambil profile";
      if (err?.status === 401 || err?.statusCode === 401) {
        token.value = null;
        user.value = null;
        error.value = null;

        if (import.meta.client) {
          localStorage.removeItem("auth_token");
        }
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;

    try {
      if (token.value) {
        await $fetch("/auth/logout", {
          baseURL: config.public.apiBase,
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token.value}`,
          },
        });
      }
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      token.value = null;
      user.value = null;
      error.value = null;

      if (import.meta.client) {
        localStorage.removeItem("auth_token");
      }
      loading.value = false;
    }
  };

  return {
    token,
    user,
    loading,
    error,
    login,
    getProfile,
    logout,
  };
});
