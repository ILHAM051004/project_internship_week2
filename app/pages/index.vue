<script setup>
definePageMeta({
  middleware: "auth"
})
</script>

<template>
  <div class="relative h-screen w-screen">
    <MapView />
    <Sidebar />
  </div>
</template>