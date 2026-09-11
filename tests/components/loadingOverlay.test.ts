import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { ref } from "vue";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";
import LoadingOverlay from "~/components/LoadingOverlay.vue";

const { mockUseLoadingIndicator } = vi.hoisted(() => ({
  mockUseLoadingIndicator: vi.fn(),
}));

mockNuxtImport("useLoadingIndicator", () => mockUseLoadingIndicator);

describe("LoadingOverlay.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Component rendering", () => {
    it("should mount the LoadingOverlay component successfully", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(false),
      });

      const component = mountWithVuetify(LoadingOverlay);
      expect(component).toBeDefined();
      expect(component.vm).toBeDefined();
    });

    it("should render v-container element when isLoading is true", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const container = component.findComponent({ name: "VContainer" });

      expect(container.exists()).toBe(true);
    });

    it("should not render v-container element when isLoading is false", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(false),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const container = component.findComponent({ name: "VContainer" });

      expect(container.exists()).toBe(false);
    });

    it("should render v-row component inside v-container", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const row = component.findComponent({ name: "VRow" });

      expect(row.exists()).toBe(true);
    });

    it("should render v-col component inside v-row", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const col = component.findComponent({ name: "VCol" });

      expect(col.exists()).toBe(true);
    });

    it("should render v-progress-linear component inside v-col", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const progressLinear = component.findComponent({ name: "VProgressLinear" });

      expect(progressLinear.exists()).toBe(true);
    });
  });

  describe("v-container props", () => {
    it("should have fluid prop set to true", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const container = component.findComponent({ name: "VContainer" });

      expect(container.props("fluid")).toBe(true);
    });

    it("should have correct CSS classes", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const container = component.findComponent({ name: "VContainer" });

      const classes = (container.classes() as string[]).join(" ");
      expect(classes).toContain("v-container");
      expect(classes).toContain("align-center");
      expect(classes).toContain("justify-center");
    });
  });

  describe("v-row props and classes", () => {
    it("should have correct CSS classes", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const row = component.findComponent({ name: "VRow" });

      const classes = (row.classes() as string[]).join(" ");
      expect(classes).toContain("v-row");
      expect(classes).toContain("align--center");
      expect(classes).toContain("justify--center");
    });
  });

  describe("v-col props", () => {
    it("should have cols prop set to 3", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const col = component.findComponent({ name: "VCol" });

      expect(["3", 3]).toContain(col.props("cols"));
    });
  });

  describe("v-progress-linear props", () => {
    it("should have color prop set to primary", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const progressLinear = component.findComponent({ name: "VProgressLinear" });

      expect(progressLinear.props("color")).toBe("primary");
    });

    it("should have height prop set to 10", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const progressLinear = component.findComponent({ name: "VProgressLinear" });

      expect(["10", 10]).toContain(progressLinear.props("height"));
    });

    it("should have indeterminate prop set to true", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const progressLinear = component.findComponent({ name: "VProgressLinear" });

      expect(progressLinear.props("indeterminate")).toBe(true);
    });

    it("should have rounded prop set to true", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const progressLinear = component.findComponent({ name: "VProgressLinear" });

      expect(progressLinear.props("rounded")).toBe(true);
    });
  });

  describe("Conditional rendering based on isLoading", () => {
    it("should show overlay when isLoading changes to true", async () => {
      const isLoading = ref(false);
      mockUseLoadingIndicator.mockReturnValue({ isLoading });

      const component = mountWithVuetify(LoadingOverlay);
      expect(component.findComponent({ name: "VContainer" }).exists()).toBe(false);

      isLoading.value = true;
      await component.vm.$nextTick();

      expect(component.findComponent({ name: "VContainer" }).exists()).toBe(true);
    });

    it("should hide overlay when isLoading changes to false", async () => {
      const isLoading = ref(true);
      mockUseLoadingIndicator.mockReturnValue({ isLoading });

      const component = mountWithVuetify(LoadingOverlay);
      expect(component.findComponent({ name: "VContainer" }).exists()).toBe(true);

      isLoading.value = false;
      await component.vm.$nextTick();

      expect(component.findComponent({ name: "VContainer" }).exists()).toBe(false);
    });
  });

  describe("useLoadingIndicator integration", () => {
    it("should call useLoadingIndicator", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(false),
      });

      mountWithVuetify(LoadingOverlay);
      expect(mockUseLoadingIndicator).toHaveBeenCalled();
    });

    it("should use isLoading from composable", () => {
      const isLoading = ref(true);
      mockUseLoadingIndicator.mockReturnValue({ isLoading });

      const component = mountWithVuetify(LoadingOverlay);
      expect(component.findComponent({ name: "VContainer" }).exists()).toBe(true);
    });
  });

  describe("HTML structure", () => {
    it("should have v-row inside v-container", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const container = component.findComponent({ name: "VContainer" });
      const row = container.findComponent({ name: "VRow" });

      expect(row.exists()).toBe(true);
    });

    it("should have v-col inside v-row", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const row = component.findComponent({ name: "VRow" });
      const col = row.findComponent({ name: "VCol" });

      expect(col.exists()).toBe(true);
    });

    it("should have v-progress-linear inside v-col", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(true),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const col = component.findComponent({ name: "VCol" });
      const progressLinear = col.findComponent({ name: "VProgressLinear" });

      expect(progressLinear.exists()).toBe(true);
    });
  });

  describe("Edge cases", () => {
    it("should not render anything when isLoading is false", () => {
      mockUseLoadingIndicator.mockReturnValue({
        isLoading: ref(false),
      });

      const component = mountWithVuetify(LoadingOverlay);
      const html = component.html();

      expect(html.trim()).toBe("<!--v-if-->");
    });
  });
});
