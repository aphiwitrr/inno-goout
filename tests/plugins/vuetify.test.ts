import { describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const { mockDefineNuxtPlugin } = vi.hoisted(() => ({
  mockDefineNuxtPlugin: vi.fn((cb: Function) => cb),
}));

mockNuxtImport("defineNuxtPlugin", () => mockDefineNuxtPlugin);

vi.mock("vuetify", () => ({
  createVuetify: vi.fn(() => ({
    install: vi.fn(),
  })),
}));

vi.mock("vuetify/locale", () => ({
  th: {},
  en: {},
}));

vi.mock("@mdi/font/css/materialdesignicons.css", () => ({}));
vi.mock("~/assets/sass/font.sass", () => ({}));
vi.mock("~/assets/sass/main.sass", () => ({}));

describe("Vuetify Plugin", () => {
  it("should export a plugin function", async () => {
    const plugin = await import("~/plugins/01.vuetify");
    expect(plugin.default).toBeDefined();
    expect(typeof plugin.default).toBe("function");
  });

  it("should call app.vueApp.use with vuetify instance", async () => {
    const mockUse = vi.fn();
    const mockApp = { vueApp: { use: mockUse } };

    const plugin = await import("~/plugins/01.vuetify");
    const pluginFn = plugin.default as Function;
    pluginFn(mockApp);

    expect(mockUse).toHaveBeenCalled();
  });

  it("should create vuetify with correct theme colors", async () => {
    const { createVuetify } = await import("vuetify");

    const mockApp = { vueApp: { use: vi.fn() } };
    const plugin = await import("~/plugins/01.vuetify");
    const pluginFn = plugin.default as Function;
    pluginFn(mockApp);

    expect(createVuetify).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: expect.objectContaining({
          defaultTheme: "light",
          themes: expect.objectContaining({
            light: expect.objectContaining({
              colors: expect.objectContaining({
                primary: "#2E7D32",
                error: "#FF5252",
              }),
            }),
          }),
        }),
        icons: { defaultSet: "mdi" },
        locale: expect.objectContaining({
          locale: "th",
          fallback: "th",
        }),
      }),
    );
  });
});
