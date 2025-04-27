// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  app: {
    head: {
      charset: "utf-8",
      title: "Morse Code Playground",
      meta: [
        {
          name: "description",
          content: "Nuxt 3 App",
        },
      ],
    },
  },
});
