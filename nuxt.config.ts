export default defineNuxtConfig({
  ssr: true,
  srcDir: "src/",
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/color-mode", "@nuxt/icon"],
  css: ["~/assets/css/main.css"],
  components: [
    { path: "~/shared/ui", pathPrefix: false },
    { path: "~/entities/project/ui", pathPrefix: false },
    { path: "~/features/project-chat/ui", pathPrefix: false },
    { path: "~/features/project-tasks/ui", pathPrefix: false },
    { path: "~/features/project-images/ui", pathPrefix: false },
    { path: "~/features/project-edit/ui", pathPrefix: false },
    { path: "~/features/project-members/ui", pathPrefix: false },
    { path: "~/features/theme-toggle/ui", pathPrefix: false },
    { path: "~/features/session-switcher/ui", pathPrefix: false },
    { path: "~/features/project-create/ui", pathPrefix: false },
    { path: "~/widgets/project-list/ui", pathPrefix: false },
    { path: "~/widgets/project-details/ui", pathPrefix: false }
  ],
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
