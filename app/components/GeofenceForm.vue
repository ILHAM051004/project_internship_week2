<script setup>
import { ref, watch } from "vue";
import { useGeofenceStore } from "@/stores/geofenceStore";

const store = useGeofenceStore();
const name = ref("");

watch(
  () => store.editingGeofence,
  (geo) => {
    name.value = geo ? geo.name || "" : "";
  },
  {
    immediate: true,
  }
);

function saveGeofence() {
  if (!name.value.trim()) {
    alert("Nama geofence harus diisi");
    return;
  }
  if (!store.tempGeometry) {
    alert("Silakan gambar geofence terlebih dahulu");
    return;
  }

  const data = {
    id: store.isEditing
      ? store.editingGeofence.id
      : Date.now(),
    name: name.value.trim(),
    type: store.type,
    color: store.color || "#2563eb",
    geometry: store.tempGeometry,
  };

  if (store.isEditing) {
    store.updateGeofence(data);
  } else {
    store.addGeofence(data);
  }
  store.closeForm();
  name.value = "";
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="space-y-4 p-4">
      <div>
        <label class="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Nama Geofence
        </label>
        <input v-model="name" type="text" placeholder="Contoh: Area Kantor"
          class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
      </div>

      <div>
        <label class="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Tipe Area
        </label>
        <div class="relative">
          <select v-model="store.type"
            class="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-10 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10">
            <option value="polygon">
              Poligon
            </option>
            <option value="circle">
              Lingkaran
            </option>
          </select>

          <svg xmlns="http://www.w3.org/2000/svg"
            class="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Warna Area
        </label>
        <div class="flex gap-2">
          <input v-model="store.color" type="text" placeholder="#2563eb"
            class="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
          <div class="flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <input v-model="store.color" type="color"
              class="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0" />
          </div>
        </div>
      </div>

      <div class="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
        <p class="text-[10px] leading-relaxed text-blue-700">
          Pilih tipe lalu gambar geofence pada map.
        </p>
      </div>
    </div>

    <div class="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
      <button
        class="h-10 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
        @click="store.closeForm()">
        Batal
      </button>
      <button
        class="h-10 flex-1 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
        @click="saveGeofence">
        {{ store.isEditing ? "Simpan" : "Simpan" }}
      </button>
    </div>
  </div>
</template>