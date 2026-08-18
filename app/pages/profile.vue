<script setup>
import { useAuthStore } from '~/stores/authStore';

definePageMeta({
  middleware: "auth"
})

const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.getProfile();
  } catch (error) {
    console.error("Profile error:", error)
  }
})

const handleLogout = async () => {
  await authStore.logout()
  await navigateTo("/login")
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-6">
    <div class="mx-auto max-w-5xl">
      <div class="mb-6 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-slate-800">
            Profile
          </h1>
          <p class="text-sm text-slate-500">
            Data profile dari REST API
          </p>
        </div>
        <button class="rounded-xl bg-red-500 px-5 py-2.5 font-medium text-white transition hover:bg-red-600"
          :disabled="authStore.loading" @click="handleLogout">
          Logout
        </button>
      </div>
      <div class="rounded-2xl bg-white p-6 shadow-sm">
        <div v-if="authStore.loading" class="py-10 text-center text-slate-500">
          Loading profile...
        </div>
        <div v-else-if="authStore.error" class="rounded-xl bg-red-50 p-4 text-red-600">
          {{ authStore.error }}
        </div>
        <div v-else-if="authStore.user">
          <h2 class="mb-4 text-lg font-semibold text-slate-800">
            Profile Data
          </h2>
          <pre
            class="overflow-auto rounded-xl bg-slate-900 p-5 text-sm text-white">{{ JSON.stringify(authStore.user, null, 2) }}</pre>
        </div>
        <div v-else class="py-10 text-center text-slate-500">
          Data profile belum tersedia
        </div>
      </div>
    </div>
  </div>
</template>