// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

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
      link: [
        {
          rel: "icon",
          type: "image/png",
          // TODO: add a favicon
          href: "/favicon.png",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
        },
      ],
    },
  },

  modules: ["@nuxt/icon"],
})
