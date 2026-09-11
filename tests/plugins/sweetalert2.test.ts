import { describe, it, expect, vi } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

const { mockDefineNuxtPlugin } = vi.hoisted(() => ({
  mockDefineNuxtPlugin: vi.fn((cb: Function) => cb),
}));

mockNuxtImport("defineNuxtPlugin", () => mockDefineNuxtPlugin);

vi.mock("sweetalert2", () => ({
  default: {
    mixin: vi.fn((config: unknown) => ({ ...config, fire: vi.fn() })),
  },
}));

vi.mock("sweetalert2/dist/sweetalert2.min.css", () => ({}));

describe("SweetAlert2 Plugin", () => {
  it("should export a plugin function", async () => {
    const plugin = await import("~/plugins/02.sweetalert2");
    expect(plugin.default).toBeDefined();
    expect(typeof plugin.default).toBe("function");
  });

  it("should call nuxtApp.provide with swal", async () => {
    const mockProvide = vi.fn();
    const mockNuxtApp = { provide: mockProvide };

    const plugin = await import("~/plugins/02.sweetalert2");
    const pluginFn = plugin.default as Function;
    pluginFn(mockNuxtApp);

    expect(mockProvide).toHaveBeenCalledWith("swal", expect.any(Object));
  });

  it("should create swal mixin with Thai button text", async () => {
    const Swal = (await import("sweetalert2")).default;

    const mockNuxtApp = { provide: vi.fn() };
    const plugin = await import("~/plugins/02.sweetalert2");
    const pluginFn = plugin.default as Function;
    pluginFn(mockNuxtApp);

    expect(Swal.mixin).toHaveBeenCalledWith(
      expect.objectContaining({
        confirmButtonText: "ตกลง",
        cancelButtonText: "ปิด",
        buttonsStyling: false,
      }),
    );
  });

  it("should set custom classes for popup and buttons", async () => {
    const Swal = (await import("sweetalert2")).default;

    const mockNuxtApp = { provide: vi.fn() };
    const plugin = await import("~/plugins/02.sweetalert2");
    const pluginFn = plugin.default as Function;
    pluginFn(mockNuxtApp);

    expect(Swal.mixin).toHaveBeenCalledWith(
      expect.objectContaining({
        customClass: expect.objectContaining({
          confirmButton: expect.any(String),
          cancelButton: expect.any(String),
          actions: expect.any(String),
        }),
      }),
    );
  });
});
