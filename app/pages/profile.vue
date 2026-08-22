<script setup>
import { useAuthStore } from "~/stores/authStore";
import { ref, onMounted } from "vue";

definePageMeta({
  middleware: "auth",
});

const authStore = useAuthStore();
const checkingAuth = ref(true);

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

  try {
    if (!authStore.user) {
      await authStore.getProfile();
    }
  } catch (error) {
    console.error("Profile error:", error);

    if (!authStore.token) {
      await navigateTo("/login", { replace: true });
      return;
    }
  } finally {
    checkingAuth.value = false;
  }
});

const handleLogout = async () => {
  await authStore.logout();
  await navigateTo("/login", { replace: true });
};
</script>

<template>
  <div v-if="!checkingAuth" class="min-h-screen bg-slate-100 px-8 py-6">
    <div class="mx-auto max-w-4xl">
      <div
        v-if="authStore.loading"
        class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
      >
        <p class="text-sm text-slate-400">Memuat profile...</p>
      </div>

      <div
        v-else-if="authStore.user"
        class="rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-7 py-5"
        >
          <div>
            <button
              @click="navigateTo('/')"
              class="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 12H5m7 7-7-7 7-7"
                />
              </svg>
              Kembali
            </button>

            <h2 class="text-lg font-semibold text-slate-800">Profile Data</h2>

            <p class="mt-1 text-sm text-slate-400">
              Informasi akun yang sedang digunakan
            </p>
          </div>

          <button
            @click="handleLogout"
            class="rounded-xl bg-slate-50 px-5 py-2.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>

        <div class="p-7">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div class="rounded-xl bg-slate-50 px-5 py-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Email
              </p>

              <p class="mt-2 text-sm font-medium text-slate-700">
                {{ authStore.user.email }}
              </p>
            </div>

            <div class="rounded-xl bg-slate-50 px-5 py-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Role
              </p>

              <p class="mt-2 text-sm font-medium text-slate-700">
                {{ authStore.user.role_name }}
              </p>
            </div>

            <div class="rounded-xl bg-slate-50 px-5 py-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Bergabung Sejak
              </p>

              <p class="mt-2 text-sm font-medium text-slate-700">
                {{
                  new Date(authStore.user.created_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )
                }}
              </p>
            </div>

            <div class="rounded-xl bg-slate-50 px-5 py-4">
              <p
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Status
              </p>

              <div class="mt-2 flex items-center gap-2">
                <span
                  class="h-2 w-2 rounded-full"
                  :class="
                    authStore.user.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                  "
                ></span>

                <span
                  class="text-sm font-medium"
                  :class="
                    authStore.user.is_active
                      ? 'text-emerald-600'
                      : 'text-slate-400'
                  "
                >
                  {{ authStore.user.is_active ? "Active" : "Inactive" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else
        class="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-red-500 shadow-sm"
      >
        Profile tidak ditemukan.
      </div>
    </div>
  </div>
</template>
