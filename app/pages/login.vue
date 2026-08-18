<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();

const email = ref("");
const password = ref("")

const handleLogin = async () => {
  try {
    await authStore.login(email.value, password.value);
    await navigateTo("/profile")
  } catch (error) {
    console.error("Login error:", error)
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 class="mb-2 text-2xl font-bold text-slate-500">
        Login
      </h1>
      <p class="mb-6 text-sm text-slate-500">
        GPS Monitoring
      </p>
      <form class="space-y-4" @submit.prevent="handleLogin">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input v-model="email" type="email" placeholder="Masukkan email"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            required />
        </div>
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input v-model="password" type="password" placeholder="Masukkan password"
            class="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            required />
        </div>
        <p v-if="authStore.error" class="text-sm text-red-500">{{ authStore.error }}</p>
        <button type="submit" :disabled="authStore.loading"
          class="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50">
          {{ authStore.loading ? "Logging in..." : "Login" }}
        </button>
      </form>
    </div>
  </div>
</template>