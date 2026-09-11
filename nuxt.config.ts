// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";

// ── แก้ตรงนี้ที่เดียว ────────────────────────────────
const APP_BASE_URL = "/watermark-v2/";

export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
  ],
  ssr: false,
  imports: {
    dirs: ["repositories"],
  },
  app: {
    baseURL: APP_BASE_URL,
  },
  runtimeConfig: {
    public: {
      appVersion: process.env.NUXT_APP_VERSION || "1.0.0",
      systemName: process.env.NUXT_APP_SYSTEM_NAME || "",
      programName: process.env.NUXT_APP_PROGRAM_NAME || "",
    },
  },

  build: {
    transpile: ["vuetify"],
  },

  devServer: {
    port: 3016,
  },
  compatibilityDate: "2025-07-15",

  vite: {
    plugins: [
      // @ts-expect-error
      vuetify({ autoImport: true })],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
    server: {
      watch: {
        usePolling: true,
      },
      proxy: {
        "/api": {
          target: process.env.NUXT_PROXY_TARGET ?? "https://e-service4.bora.dopa.go.th",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
});
