import "@mdi/font/css/materialdesignicons.css";

import { createVuetify } from "vuetify";

import "../assets/sass/font.scss"; // import file font
import "../assets/sass/main.sass"; // import file main
import { th, en } from "vuetify/locale";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    theme: {
      defaultTheme: "light",
      themes: {
        light: {
          colors: {
            primary: "#2E7D32",
            secondary: "rgba(237, 231, 246, 1)",
            accent: "#82B1FF",
            error: "#FF5252",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FFC107",
          },
        },
      },
    },
    icons: {
      defaultSet: "mdi",
    },
    locale: {
      locale: "th",
      fallback: "th",
      messages: { th, en },
    },
  });
  app.vueApp.use(vuetify);
});
