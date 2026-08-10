import { defineStore } from "pinia";
import { ref } from "vue";

export const useGeofenceStore = defineStore("geofenceStore", () => {
  const showForm = ref(false);
  const isEditing = ref(false);
  const editingGeofence = ref(null);
  const isDrawing = ref(false);
  const tempGeometry = ref(null);
  const geofence = ref([]);
  const type = ref("polygon");
  const color = ref("#2563eb");
  const originalGeometry = ref(null);
  const originalType = ref(null);


  function loadGeo() {
    if (!import.meta.client) return;
    const saved = localStorage.getItem("geofence");

    if (saved) {
      try {
        geofence.value = JSON.parse(saved);
      } catch {
        geofence.value = [];
      }
    }
  }

  function save() {
    if (import.meta.client) {
      localStorage.setItem("geofence", JSON.stringify(geofence.value));
    }
  }

  function openForm() {
    showForm.value = true;
    isEditing.value = false;
    editingGeofence.value = null;
    type.value = "polygon";
    color.value = "#2563eb";
    originalGeometry.value = null;
    originalType.value = null;
    tempGeometry.value = null;
    isDrawing.value = true;
  }

  function closeForm() {
    showForm.value = false;
    isEditing.value = false;
    editingGeofence.value = null;
    isDrawing.value = false;
    tempGeometry.value = null;
    originalGeometry.value = null;
    originalType.value = null;
    type.value = "polygon";
    color.value = "#2563eb";
  }

  function selectGeofence(geo) {
    if (!import.meta.client) {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("focus-geofence", {
        detail: geo,
      }),
    );
  }

  function startDrawing() {
    isDrawing.value = true;
    tempGeometry.value = null;
  }

  function stopDrawing() {
    isDrawing.value = false;
  }

  function setTempGeometry(geometry) {
    tempGeometry.value = geometry;
  }

  function addGeofence(data) {
    geofence.value.push(data);
    save();
  }

  function startEdit(data) {
    editingGeofence.value = data;
    isEditing.value = true;
    showForm.value = true;
    type.value = data.type || "polygon";
    color.value = data.color || "#2563eb";
    originalType.value = data.type || "polygon";
    originalGeometry.value = data.geometry
      ? JSON.parse(JSON.stringify(data.geometry))
      : null;
    tempGeometry.value = data.geometry
      ? JSON.parse(JSON.stringify(data.geometry))
      : null;
    isDrawing.value = false;
  }

  function updateGeofence(updated) {
    const index = geofence.value.findIndex((g) => g.id === updated.id);
    if (index !== -1) {
      geofence.value[index] = updated;
      save();
    }
  }

  function deleteGeofence(id) {
    geofence.value = geofence.value.filter((g) => g.id !== id);
    save();
  }

  return {
    geofence,
    showForm,
    isEditing,
    editingGeofence,
    isDrawing,
    tempGeometry,
    type,
    color,
    originalGeometry,
    originalType,
    openForm,
    closeForm,
    startDrawing,
    stopDrawing,
    setTempGeometry,
    addGeofence,
    startEdit,
    updateGeofence,
    deleteGeofence,
    selectGeofence,
    loadGeo
  };
});
