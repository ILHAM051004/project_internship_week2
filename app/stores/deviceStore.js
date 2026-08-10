import { defineStore } from "pinia";
import { ref } from "vue";

export const useDeviceStore = defineStore("deviceStore", () => {
  const showForm = ref(false);
  const isAdding = ref(false);
  const tempLocation = ref(null);
  const isEditing = ref(false);
  const editingDevice = ref(null);
  const devices = ref([]);
  const selectedDevice = ref(null);

  function loadDevices() {
    if (!import.meta.client) return;

    const saved = localStorage.getItem("devices");

    if (saved) {
      try {
        devices.value = JSON.parse(saved);
      } catch {
        devices.value = [];
      }
    }
  }

  function selectDevice(device) {
    selectedDevice.value = device;
  }

  function startAdding() {
    isAdding.value = true;
    isEditing.value = false;
    editingDevice.value = null;
    showForm.value = true;
    tempLocation.value = null;
  }

  function setTempLocation(lat, lng) {
    tempLocation.value = {
      lat,
      lng,
    };

    showForm.value = true;
  }

  function addDevice(device) {
    devices.value.push(device);
    saveToLocalStorage();
  }

  function updateDevice(updated) {
    const index = devices.value.findIndex((d) => d.id === updated.id);

    if (index !== -1) {
      devices.value[index] = updated;
      saveToLocalStorage();
    }
  }

  function startEdit(device) {
    editingDevice.value = {
      ...device,
    };

    tempLocation.value = {
      lat: device.lat,
      lng: device.lng,
    };

    isEditing.value = true;
    isAdding.value = false;
    showForm.value = true;
  }

  function cancelAdding() {
    isAdding.value = false;
    isEditing.value = false;
    showForm.value = false;
    tempLocation.value = null;
    editingDevice.value = null;
  }

  function deleteDevice(id) {
    devices.value = devices.value.filter((d) => d.id !== id);

    saveToLocalStorage();
  }

  function saveToLocalStorage() {
    if (import.meta.client) {
      localStorage.setItem("devices", JSON.stringify(devices.value));
    }
  }

  return {
    devices,
    selectedDevice,
    showForm,
    tempLocation,
    selectDevice,
    addDevice,
    isAdding,
    isEditing,
    editingDevice,
    startEdit,
    updateDevice,
    deleteDevice,
    startAdding,
    setTempLocation,
    cancelAdding,
    loadDevices,
  };
});
