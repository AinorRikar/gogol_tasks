export default defineNuxtConfig({
  ssr: true,
  srcDir: "src/",
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/color-mode", "@nuxt/icon"],
  css: ["~/assets/css/main.css"],
  /**
   * После отказа от `components: [...]` в конфиге Nuxt в content Tailwind попадает только
   * `src/components/**` (папки может не быть). Явно сканируем FSD-слои и остальной `src`.
   */
  tailwindcss: {
    config: {
      content: ["./src/**/*.{vue,js,ts,mjs}"]
    }
  },
  compatibilityDate: "2026-01-01",
  devtools: { enabled: false },
  nitro: {
    routeRules: {
      "/api/**": {
        cors: true,
        headers: {
          "access-control-allow-credentials": "true",
          "access-control-allow-origin": process.env.CORS_ORIGIN || "http://localhost:3000",
          "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          "access-control-allow-headers": "Content-Type"
        }
      }
    }
  },
  colorMode: {
    classSuffix: "",
    storage: "localStorage",
    storageKey: "gogol-color-mode"
  }
});
