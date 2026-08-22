<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/authStore";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const ready = ref(false);

onMounted(async () => {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    authStore.token = null;
    authStore.user = null;
    authStore.error = null;

    await navigateTo("/login", { replace: true });
    return;
  }

  authStore.token = token;
  ready.value = true;
});
</script>

<template>
  <div v-if="ready" class="relative h-screen w-screen">
    <MapView />
    <Sidebar />
  </div>
</template>
