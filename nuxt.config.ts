// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import { filterBrokenPrecacheUrls } from "./pwa.manifest-transform";

const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || "https://noir-basel.com";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: true,

  nitro: {
    preset: "static",
    prerender: {
      crawlLinks: true,
      failOnError: false,
      ignore: ["/404", "/200"],
    },
  },
  runtimeConfig: {
    public: {
      /** Basis-URL der Booking-API inkl. `/api` — z. B. `http://127.0.0.1:8000/api` */
      /* apiBase: "https://barber-mo.com/api", */
      apiBase: "http://127.0.0.1:8000/api",
    },
  },
  modules: ["@pinia/nuxt", "@nuxtjs/i18n", "@vite-pwa/nuxt"],
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
          content: "width=device-width, initial-scale=1, viewport-fit=cover",
        },
        {
          name: "description",
          content:
            "NOIR BASEL: luxury hair salon Basel, premium Friseur Basel, high-end hairdresser. Präzision, Ruhe und zeitlose Eleganz.",
        },
        { property: "og:type", content: "website" },
        { property: "og:image", content: `${siteUrl}/og-image.png` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: `${siteUrl}/og-image.png` },
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
          type: "image/png",
          sizes: "32x32",
          href: "/favicon.png",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
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
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'gsap',
        'gsap/ScrollTrigger',
        'three',
      ]
    }
  },
  i18n: {
    defaultLocale: "de",
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
    locales: [
      { code: "de", language: "de-DE", name: "Deutsch", file: "de.json" },
      { code: "en", language: "en-GB", name: "English", file: "en.json" },
      { code: "fr", language: "fr-FR", name: "Français", file: "fr.json" },
      { code: "it", language: "it-IT", name: "Italiano", file: "it.json" },
    ],
    // v10: langDir ist relativ zu <rootDir>/i18n — ../locales zeigt auf die kanonischen Dateien im Projektroot
    langDir: "../locales",
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "NOIR Admin",
      short_name: "NOIR Admin",
      description: "Terminverwaltung für NOIR BASEL",
      theme_color: "#171717",
      background_color: "#171717",
      display: "standalone",
      display_override: ["standalone", "minimal-ui"],
      start_url: "/admin",
      scope: "/",
      id: "/admin",
      icons: [
        {
          src: "/pwa-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/pwa-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "/pwa-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/200.html",
      navigateFallbackDenylist: [/^\/api/, /^\/_nuxt/, /^\/sw\.js$/, /^\/workbox-/],
      importScripts: ["/admin-push-handler.js"],
      globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,webmanifest}"],
      globIgnores: ["**/node_modules/**"],
      manifestTransforms: [filterBrokenPrecacheUrls],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: "module",
    },
  },
});
