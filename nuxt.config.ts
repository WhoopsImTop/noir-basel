// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  modules: ["@nuxtjs/i18n"],
  experimental: {
    scanPageMeta: true,
  },

  //import font
  app: {
    head: {
      title: "NOIR Basel - Dein Premium Friseur in Basel!",
      meta: [
        {
          charset: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          hid: "description",
          name: "description",
          content:
            "Hey ich bin Mohammmad, besser bekannt als Barber Mo. Ich bin ein professioneller Barbier in Basel und freue mich darauf, dich zu treffen!",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://use.typekit.net/rrg2hzi.css",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.png",
        },
      ],
      script: [
        {
          src: "https://app.eu.usercentrics.eu/browser-ui/latest/loader.js",
          id: "usercentrics-cmp",
          async: true,
          "data-eu-mode": "true",
          "data-settings-id": "lNciREqJBOwvzD",
        },
      ],
    },
  },
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  i18n: {
    defaultLocale: "de",
    strategy: "prefix_except_default",
    langDir: "locales",
    locales: [
      { code: "de", name: "Deutsch", file: "de.json" },
      { code: "en", name: "English", file: "en.json" },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
