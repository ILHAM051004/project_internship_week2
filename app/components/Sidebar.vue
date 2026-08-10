<script setup>
import { computed, ref } from "vue";
import { useDeviceStore } from "@/stores/deviceStore";
import { useGeofenceStore } from "@/stores/geofenceStore";
import DeviceForm from "./DeviceForm.vue";
import GeofenceForm from "./GeofenceForm.vue";

const store = useDeviceStore();
const geofenceStore = useGeofenceStore();
const activeTab = ref("device");
const deviceKeyword = ref("");
const geofenceKeyword = ref("");

const filteredDevices = computed(() => {
  return store.devices.filter((device) =>
    device.name
      .toLowerCase()
      .includes(deviceKeyword.value.toLowerCase())
  );
});
const filteredGeofences = computed(() => {
  return geofenceStore.geofence.filter((geo) =>
    geo.name
      .toLowerCase()
      .includes(geofenceKeyword.value.toLowerCase())
  );
});
</script>

<template>
  <aside
    class="absolute left-0 top-0 z-[1000] flex h-screen w-[300px] flex-col overflow-hidden border-r border-slate-200 bg-white shadow-[4px_0_24px_rgba(15,23,42,0.08)]">
    <div class="shrink-0 border-b border-slate-100 bg-white px-4 pb-4 pt-5">
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" />
            <circle cx="12" cy="11" r="2.5" />
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="truncate text-[15px] font-bold tracking-tight text-slate-800">
            GPS Monitoring
          </h2>
          <p class="mt-0.5 truncate text-[10px] font-medium text-slate-400">
            Device & Geofence Management
          </p>
        </div>
      </div>

      <div class="mt-5 flex rounded-xl bg-slate-100 p-1">
        <button :class="activeTab === 'device'
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'
          "
          class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all"
          @click="activeTab = 'device'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path stroke-linecap="round" d="M9 7h6M9 17h6" />
          </svg>
          Device
        </button>
        <button :class="activeTab === 'geofence'
          ? 'bg-white text-blue-600 shadow-sm'
          : 'text-slate-500 hover:text-slate-700'"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all"
          @click="activeTab = 'geofence'">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 4h12l2 8-8 8-8-8 2-8Z" />
          </svg>
          Geofence
        </button>
      </div>
    </div>

    <div v-if="activeTab === 'device'" class="flex min-h-0 flex-1 -translate-y-4 flex-col bg-slate-50">
      <template v-if="!store.showForm">
        <div class="shrink-0 border-b border-slate-100 bg-white p-3">
          <div class="flex gap-2">
            <div class="relative min-w-0 flex-1">
              <svg xmlns="http://www.w3.org/2000/svg"
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" d="m20 20-4-4" />
              </svg>
              <input v-model="deviceKeyword" type="text" placeholder="Pencarian device..."
                class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <button
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
              @click="store.startAdding()">
              +
            </button>
          </div>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <div class="mb-3 flex items-center justify-between px-1">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Daftar Device
              </p>
            </div>
            <span class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
              {{ filteredDevices.length }}
            </span>
          </div>

          <div class="space-y-2">
            <div v-for="device in filteredDevices" :key="device.id"
              class="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5"
              @click="store.selectDevice(device)">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <h4 class="truncate text-sm font-semibold text-slate-800">
                      {{ device.name }}
                    </h4>
                    <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"></span>
                  </div>
                  <div class="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                    <span>
                      Lat
                      <span class="text-slate-600">
                        {{ device.lat }}
                      </span>
                    </span>
                    <span>
                      Lng
                      <span class="text-slate-600">
                        {{ device.lng }}
                      </span>
                    </span>
                  </div>
                </div>

                <div class="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                    @click.stop="store.startEdit(device)">
                    ✎
                  </button>

                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                    @click.stop="store.deleteDevice(device.id)">
                    🗑
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredDevices.length === 0"
              class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center">
              <p class="mt-3 text-xs font-semibold text-slate-600">
                Belum ada device
              </p>
              <p class="mt-1 text-[10px] leading-relaxed text-slate-400">
                Tambahkan device menggunakan tombol + di atas.
              </p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="min-h-0 flex-1 overflow-y-auto p-3">
        <DeviceForm />
      </div>
    </div>

    <div v-else class="flex min-h-0 flex-1 -translate-y-4 flex-col bg-slate-50">
      <template v-if="!geofenceStore.showForm">
        <div class="shrink-0 border-b border-slate-100 bg-white p-3">
          <div class="flex gap-2">
            <div class="relative min-w-0 flex-1">
              <svg xmlns="http://www.w3.org/2000/svg"
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" d="m20 20-4-4" />
              </svg>
              <input v-model="geofenceKeyword" type="text" placeholder="Pencarian geofence..."
                class="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
            </div>
            <button
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-xl font-medium text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
              @click="geofenceStore.openForm()">
              +
            </button>
          </div>
        </div>

        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <div class="mb-3 flex items-center justify-between px-1">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Daftar Geofence
              </p>
            </div>
            <span class="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-600">
              {{ filteredGeofences.length }}
            </span>
          </div>

          <div class="space-y-2">
            <div v-for="geo in filteredGeofences" :key="geo.id"
              class="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5"
              @click="geofenceStore.selectGeofence(geo)">
              <div class="flex items-center gap-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <span v-if="geo.type === 'polygon'" class="text-base">
                    ⬡
                  </span>

                  <span v-else class="text-lg">
                    ○
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="truncate text-sm font-semibold text-slate-800">
                    {{ geo.name }}
                  </h4>
                  <div class="mt-1.5 flex items-center gap-2">
                    <span
                      class="rounded-md bg-blue-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-600">
                      {{ geo.type === "polygon" ? "Poligon" : "Lingkaran" }}
                    </span>
                    <span class="h-2 w-2 rounded-full ring-2 ring-white" :style="{
                      backgroundColor: geo.color || '#2563eb',
                    }"></span>
                  </div>
                </div>

                <div class="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                    @click.stop="geofenceStore.startEdit(geo)">
                    ✎
                  </button>
                  <button
                    class="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                    @click.stop="geofenceStore.deleteGeofence(geo.id)">
                    🗑
                  </button>
                </div>
              </div>
            </div>

            <div v-if="filteredGeofences.length === 0"
              class="rounded-2xl border border-dashed border-slate-200 bg-white px-4 text-center">
              <p class="mt-3 text-xs font-semibold text-slate-600">
                Belum ada geofence
              </p>
              <p class="mt-1 text-[10px] leading-relaxed text-slate-400">
                Tambahkan area baru menggunakan tombol + di atas.
              </p>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="min-h-0 flex-1 overflow-y-auto p-3">
        <GeofenceForm />
      </div>
    </div>
  </aside>
</template>