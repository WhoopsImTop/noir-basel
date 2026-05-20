// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  runtimeConfig: {
    public: {
      /** Basis-URL der Booking-API inkl. `/api` — z. B. `http://127.0.0.1:8000/api` */
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api",
    },
  },
  modules: ["@pinia/nuxt", "@nuxtjs/i18n"],
  experimental: {
    scanPageMeta: true,
  },

  //import font
  app: {
    head: {
      title: "NOIR BASEL – Luxury Hair Salon in Basel",
      meta: [
        {
          charset: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          name: "description",
          content:
            "NOIR BASEL: luxury hair salon Basel, premium Friseur Basel, high-end hairdresser. Präzision, Ruhe und zeitlose Eleganz.",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap",
        },
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
  vite: {
    plugins: [tailwindcss()],
  },
  i18n: {
    defaultLocale: "de",
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
    locales: [
      { code: "de", language: "de-DE", name: "Deutsch", file: "de.json" },
      { code: "en", language: "en-GB", name: "English", file: "en.json" },
    ],
    // v10: langDir ist relativ zu <rootDir>/i18n — ../locales zeigt auf die kanonischen Dateien im Projektroot
    langDir: "../locales",
  },
});
