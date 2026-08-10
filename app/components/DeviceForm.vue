<script setup>
import { ref, watch } from "vue";
import { useDeviceStore } from "@/stores/deviceStore";

const store = useDeviceStore();
const name = ref("");

watch(
  () => store.editingDevice,
  (device) => {
    name.value = device ? device.name : "";
  },
  {
    immediate: true,
  }
);

function saveDevice() {
  if (!name.value || !store.tempLocation) {
    alert("Semua field harus diisi");
    return;
  }

  if (store.isEditing) {
    store.updateDevice({
      id: store.editingDevice.id,
      name: name.value,
      lat: store.tempLocation.lat,
      lng: store.tempLocation.lng,
    });
  } else {
    store.addDevice({
      id: Date.now(),
      name: name.value,
      lat: store.tempLocation.lat,
      lng: store.tempLocation.lng,
    });
  }

  name.value = "";
  store.cancelAdding();
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="space-y-4 p-4">
      <div>
        <label class="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Nama Device
        </label>
        <input v-model="name" type="text" placeholder="Contoh: Truck 01"
          class="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" />
      </div>

      <div>
        <label class="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Latitude
        </label>
        <div class="relative">
          <input readonly :value="store.tempLocation?.lat ?? '-'"
            class="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 pr-10 text-sm text-slate-500 outline-none" />
          <svg xmlns="http://www.w3.org/2000/svg"
            class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v20M2 12h20" />
          </svg>
        </div>
      </div>

      <div>
        <label class="mb-1.5 block text-[11px] font-semibold text-slate-600">
          Longitude
        </label>
        <div class="relative">
          <input readonly :value="store.tempLocation?.lng ?? '-'"
            class="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 pr-10 text-sm text-slate-500 outline-none" />
          <svg xmlns="http://www.w3.org/2000/svg"
            class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v20M2 12h20" />
          </svg>
        </div>
      </div>

      <div class="flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
        <p class="text-[10px] leading-relaxed text-blue-700">
          Klik pada map untuk menentukan koordinat.
        </p>
      </div>
    </div>

    <div class="flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3">
      <button
        class="h-10 flex-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 active:scale-[0.98]"
        @click="store.cancelAdding()">
        Batal
      </button>
      <button
        class="h-10 flex-1 rounded-xl bg-blue-600 text-xs font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
        @click="saveDevice">
        {{ store.isEditing ? "Simpan" : "Simpan" }}
      </button>
    </div>
  </div>
</template>