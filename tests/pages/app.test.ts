import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";
import App from "../../app/app.vue";

const {
  mockUseRuntimeConfig,
  mockUseHead,
  mockUseSeoMeta,
  mockUseLoadingIndicator,
} = vi.hoisted(() => ({
  mockUseRuntimeConfig: vi.fn(),
  mockUseHead: vi.fn(),
  mockUseSeoMeta: vi.fn(),
  mockUseLoadingIndicator: vi.fn(),
}));

mockNuxtImport("useRuntimeConfig", () => mockUseRuntimeConfig);
mockNuxtImport("useHead", () => mockUseHead);
mockNuxtImport("useSeoMeta", () => mockUseSeoMeta);
mockNuxtImport("useLoadingIndicator", () => mockUseLoadingIndicator);

mockUseLoadingIndicator.mockReturnValue({ isLoading: ref(false) });

function setupMocks(options?: { programName?: string; }) {
  const programName = options?.programName ?? "ระบบทดสอบ";

  mockUseRuntimeConfig.mockReturnValue({
    public: { programName, appVersion: "1.0.0" },
  });
}

describe("App.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useHead", () => {
    it("should set viewport meta tag", () => {
      setupMocks();
      mountWithVuetify(App);

      expect(mockUseHead).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
        }),
      );
    });

    it("should set favicon link", () => {
      setupMocks();
      mountWithVuetify(App);

      expect(mockUseHead).toHaveBeenCalledWith(
        expect.objectContaining({
          link: [{ rel: "icon", href: "/images/sing.ico" }],
        }),
      );
    });

    it("should set html lang to th", () => {
      setupMocks();
      mountWithVuetify(App);

      expect(mockUseHead).toHaveBeenCalledWith(
        expect.objectContaining({
          htmlAttrs: { lang: "th" },
        }),
      );
    });
  });

  describe("useSeoMeta", () => {
    it("should set title and ogTitle from programName", () => {
      setupMocks({ programName: "Card Report System" });
      mountWithVuetify(App);

      expect(mockUseSeoMeta).toHaveBeenCalledWith({
        title: "Card Report System",
        ogTitle: "Card Report System",
      });
    });

    it("should handle empty programName", () => {
      setupMocks({ programName: "" });
      mountWithVuetify(App);

      expect(mockUseSeoMeta).toHaveBeenCalledWith({
        title: "",
        ogTitle: "",
      });
    });
  });

  describe("Template structure", () => {
    it("should render v-app wrapper", () => {
      setupMocks();
      const wrapper = mountWithVuetify(App);

      expect(wrapper.find(".v-application").exists()).toBe(true);
    });

    it("should render NuxtLoadingIndicator", () => {
      setupMocks();
      const wrapper = mountWithVuetify(App);

      expect(wrapper.findComponent({ name: "NuxtLoadingIndicator" }).exists()).toBe(true);
    });

    it("should render LoadingOverlay", () => {
      setupMocks();
      const wrapper = mountWithVuetify(App);

      expect(wrapper.findComponent({ name: "LoadingOverlay" }).exists()).toBe(true);
    });

    it("should render NuxtPage inside NuxtLayout's default slot", () => {
      setupMocks();
      const wrapper = mountWithVuetify(App, {
        global: {
          stubs: {
            NuxtLayout: { template: "<div><slot /></div>" },
          },
        },
      });

      expect(wrapper.findComponent({ name: "NuxtPage" }).exists()).toBe(true);
    });
  });
});
