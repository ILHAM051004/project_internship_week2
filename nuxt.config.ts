// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  css: [
    "~/assets/css/main.css",
    "leaflet/dist/leaflet.css",
    "leaflet-draw/dist/leaflet.draw.css",
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  app:{
    head:{
      title: "GPS Monitoring"
    }
  }
});
