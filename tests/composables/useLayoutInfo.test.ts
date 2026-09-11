import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";

import { ref } from "vue";
import type { Ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

// Import after mocks
import { useLayoutInfo } from "../../app/composables/useLayoutInfo";

// Mocks
const {
  mockUseRoute,
  mockUseState,
  mockNavigateTo,
} = vi.hoisted(() => ({
  mockUseRoute: vi.fn(),
  mockUseState: vi.fn(),
  mockNavigateTo: vi.fn(),
}));

mockNuxtImport("useRoute", () => mockUseRoute);
mockNuxtImport("useState", () => mockUseState);
mockNuxtImport("navigateTo", () => mockNavigateTo);

// Mock location
const originalLocation = globalThis.location;
beforeAll(() => {
  Object.defineProperty(globalThis, "location", {
    value: { origin: "http://localhost" } as Location,
    configurable: true,
  });
});
afterAll(() => {
  Object.defineProperty(globalThis, "location", {
    value: originalLocation,
    configurable: true,
  });
});

describe("useLayoutInfo", () => {
  let routeRef: Ref<{ path: string; }>;
  let collapsedRef: Ref<boolean>;

  beforeEach(() => {
    routeRef = ref({ path: "/" });
    collapsedRef = ref(false);
    mockUseRoute.mockReturnValue(routeRef.value);
    mockUseState.mockImplementation((_key: string, init?: () => boolean) => {
      init?.();
      return collapsedRef;
    });
    mockNavigateTo.mockReset();
  });

  it("should initialize sidebar-collapsed state with useState default of false", () => {
    useLayoutInfo();
    expect(mockUseState).toHaveBeenCalledWith("sidebar-collapsed", expect.any(Function));

    const [, initializer] = mockUseState.mock.calls[0];
    expect(initializer()).toBe(false);
  });

  it("should provide default states and functions", () => {
    const layout = useLayoutInfo();
    expect(layout.drawer).toBeDefined();
    expect(layout.isCollapsed).toBe(collapsedRef);
    expect(typeof layout.toggleCollapse).toBe("function");
    expect(typeof layout.navigateToRoute).toBe("function");
    expect(typeof layout.isActiveRoute).toBe("function");
    expect(layout.getBreadcrumbs).toBeDefined();
    expect(layout.menuItems).toBeDefined();
  });

  it("should toggle sidebar collapsed state", () => {
    const layout = useLayoutInfo();
    expect(collapsedRef.value).toBe(false);
    layout.toggleCollapse();
    expect(collapsedRef.value).toBe(true);
    layout.toggleCollapse();
    expect(collapsedRef.value).toBe(false);
  });

  it("should call navigateTo with correct params (internal)", () => {
    const layout = useLayoutInfo();
    layout.navigateToRoute("/test");
    expect(mockNavigateTo).toHaveBeenCalledWith("/test", { external: false });
  });

  it("should call navigateTo with correct params (external)", () => {
    const layout = useLayoutInfo();
    layout.navigateToRoute("/external", true);
    expect(mockNavigateTo).toHaveBeenCalledWith("/external", { external: true });
  });

  it("should detect active route", () => {
    routeRef.value.path = "/abc";
    mockUseRoute.mockReturnValue(routeRef.value);
    const layout = useLayoutInfo();
    expect(layout.isActiveRoute("/abc")).toBe(true);
    expect(layout.isActiveRoute("/def")).toBe(false);
  });

  it("should compute breadcrumbs for known route", () => {
    routeRef.value.path = "/";
    mockUseRoute.mockReturnValue(routeRef.value);
    const layout = useLayoutInfo();
    const breadcrumbs = layout.getBreadcrumbs?.value;
    expect(Array.isArray(breadcrumbs)).toBe(true);
    expect(breadcrumbs.length).toBeGreaterThan(0);
    expect(breadcrumbs[0]).toMatchObject({ title: expect.any(String), href: "/" });
  });

  it("should return empty breadcrumbs for unknown route", () => {
    routeRef.value.path = "/unknown";
    mockUseRoute.mockReturnValue(routeRef.value);
    const layout = useLayoutInfo();
    expect(layout.getBreadcrumbs?.value).toEqual([]);
  });

  it("should compute breadcrumbs when current internal menu matches route", () => {
    routeRef.value.path = "/reports";
    mockUseRoute.mockReturnValue(routeRef.value);

    const originalFind = Array.prototype.find;
    const findSpy = vi.spyOn(Array.prototype, "find").mockImplementation(function (
      this: unknown[],
      predicate: (value: unknown, index: number, obj: unknown[]) => unknown,
      thisArg?: unknown,
    ) {
      const enhancedSource = [
        ...this,
        {
          title: "Mock internal route",
          icon: "mdi-file",
          path: "/reports",
          external: false,
        },
      ];

      return originalFind.call(enhancedSource, predicate, thisArg);
    });

    const layout = useLayoutInfo();
    const breadcrumbs = layout.getBreadcrumbs?.value;

    expect(Array.isArray(breadcrumbs)).toBe(true);
    expect(breadcrumbs).toHaveLength(2);
    expect(breadcrumbs?.[0]).toMatchObject({ href: "/", disabled: false });
    expect(breadcrumbs?.[1]).toMatchObject({
      title: "Mock internal route",
      href: "/reports",
      disabled: true,
    });

    findSpy.mockRestore();
  });

  it("should compute menuItems correctly", () => {
    routeRef.value.path = "/";
    mockUseRoute.mockReturnValue(routeRef.value);
    const layout = useLayoutInfo();
    const items = layout.menuItems;
    expect(Array.isArray(items?.value)).toBe(true);
    expect(items?.value[0]).toMatchObject({
      title: expect.any(String),
      icon: expect.any(String),
      path: expect.stringContaining("/menu/idcard"),
      external: true,
    });
    expect(items?.value[1]).toMatchObject({
      title: expect.any(String),
      icon: expect.any(String),
      path: "/",
      active: true,
    });
  });
});
