<script setup>
import { ref } from "vue";
import { useAuthStore } from "~/stores/authStore";

const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);

onMounted(() => {
  authStore.error = null;
});

const handleLogin = async () => {
  authStore.error = null;
  try {
    await authStore.login(email.value, password.value);
    await navigateTo("/");
  } catch (error) {
    console.error("Login error:", error);
  }
};
</script>

<template>
  <div class="flex min-h-screen w-screen bg-slate-50">
    <div
      class="relative flex min-h-screen w-1/2 items-center justify-center overflow-hidden bg-linear-to-br from-blue-400 via-blue-600 to-blue-800"
    >
      <div
        class="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-800/20 blur-3xl"
      ></div>

      <div class="relative z-10 w-full max-w-lg px-12 text-center text-white">
        <div
          class="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-blue-600 shadow-lg shadow-blue-900/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
            />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
        </div>

        <h1 class="mt-7 text-2xl font-semibold tracking-tight">
          GPS Monitoring
        </h1>

        <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-blue-100">
          Monitoring perangkat jadi lebih simpel dan praktis
        </p>
      </div>
    </div>

    <div class="flex min-h-screen w-1/2 items-center justify-center px-8 py-10">
      <div class="w-full max-w-md">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-7 shadow-lg shadow-slate-900/5 sm:p-9"
        >
          <div class="mb-7">
            <h2
              class="text-2xl text-center font-semibold tracking-tight text-slate-800"
            >
              Welcome
            </h2>
          </div>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <div>
              <label
                class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Email
              </label>

              <div class="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>

                <input
                  v-model="email"
                  type="email"
                  placeholder="Masukkan email"
                  required
                  class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            <div>
              <label
                class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Password
              </label>

              <div class="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect width="18" height="11" x="3" y="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>

                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Masukkan password"
                  required
                  class="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-11 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="showPassword"
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
                      d="M2.06 12.35a1 1 0 0 1 0-.7C3.2 8.2 7.2 5 12 5c4.8 0 8.8 3.2 9.94 6.65a1 1 0 0 1 0 .7C20.8 15.8 16.8 19 12 19c-4.8 0-8.8-3.2-9.94-6.65Z"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>

                  <svg
                    v-else
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
                      d="m3 3 18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.94 10.94 0 0 1 12 5c4.8 0 8.8 3.2 9.94 6.65a10.8 10.8 0 0 1-2.17 3.47M6.61 6.61A10.8 10.8 0 0 0 2.06 11.65a1 1 0 0 0 0 .7C3.2 15.8 7.2 19 12 19a10.8 10.8 0 0 0 5.39-1.42"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              v-if="authStore.error"
              class="rounded-xl border border-red-100 bg-red-50 px-4 py-3"
            >
              <p class="text-xs font-medium text-red-600">
                {{ authStore.error }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="authStore.loading"
              class="flex h-12 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                v-if="authStore.loading"
                xmlns="http://www.w3.org/2000/svg"
                class="mr-2 h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 12a9 9 0 1 1-6.22-8.56"
                />
              </svg>

              {{ authStore.loading ? "Logging in..." : "Login" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
