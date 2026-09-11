import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed, defineComponent } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { VLayout } from "vuetify/components";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";
import DefaultLayout from "~/layouts/default.vue";

const {
  mockUseAuthentication,
  mockUseLayoutInfo,
  mockUseRuntimeConfig,
  mockUseDisplay,
} = vi.hoisted(() => ({
  mockUseAuthentication: vi.fn(),
  mockUseLayoutInfo: vi.fn(),
  mockUseRuntimeConfig: vi.fn(),
  mockUseDisplay: vi.fn(),
}));

mockNuxtImport("useAuthentication", () => mockUseAuthentication);
mockNuxtImport("useLayoutInfo", () => mockUseLayoutInfo);
mockNuxtImport("useRuntimeConfig", () => mockUseRuntimeConfig);

vi.mock("vuetify", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vuetify")>();
  return {
    ...actual,
    useDisplay: () => mockUseDisplay(),
  };
});

// Wrapper เพื่อให้ Vuetify inject layout ได้ (v-app-bar / v-navigation-drawer / v-main ต้องการ layout context)
const LayoutWrapper = defineComponent({
  components: { VLayout, DefaultLayout },
  template: `<v-layout><DefaultLayout><div id="page-slot">page content</div></DefaultLayout></v-layout>`,
});

const createWrapper = () => mountWithVuetify(LayoutWrapper);

describe("layouts/default.vue", () => {
  let mockGetLoginInfo: ReturnType<typeof vi.fn>;
  let mockToggleCollapse: ReturnType<typeof vi.fn>;
  let mockNavigateToRoute: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetLoginInfo = vi.fn().mockResolvedValue(undefined);
    mockToggleCollapse = vi.fn();
    mockNavigateToRoute = vi.fn();

    mockUseRuntimeConfig.mockReturnValue({
      public: {
        programName: "ระบบทดสอบ",
        appVersion: "1.0.0",
      },
    });

    mockUseDisplay.mockReturnValue({ smAndDown: ref(false) });

    mockUseAuthentication.mockReturnValue({
      getLoginInfo: mockGetLoginInfo,
      getUserName: computed(() => "สมชาย ใจดี"),
      workplace: computed(() => "[001] - สำนักงานทดสอบ"),
      error: ref(null),
    });

    mockUseLayoutInfo.mockReturnValue({
      getBreadcrumbs: computed(() => [{ title: "หน้าแรก", href: "/" }]),
      menuItems: computed(() => [
        { title: "เมนู 1", icon: "mdi-view-grid", path: "/menu", external: true, active: false },
        { title: "หน้าแรก", icon: "mdi-card-account-details", path: "/", external: false, active: true },
      ]),
      drawer: ref(true),
      isCollapsed: ref(false),
      toggleCollapse: mockToggleCollapse,
      navigateToRoute: mockNavigateToRoute,
      isActiveRoute: vi.fn(() => false),
    });
  });

  it("should call getLoginInfo on mount", () => {
    createWrapper();
    expect(mockGetLoginInfo).toHaveBeenCalled();
  });

  it("should render AppBar with programName, userName and workplace", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("ระบบทดสอบ");
    expect(wrapper.text()).toContain("สมชาย ใจดี");
    expect(wrapper.text()).toContain("[001] - สำนักงานทดสอบ");
  });

  it("should render SideBar with menu items and app version", () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain("เมนู 1");
    expect(wrapper.text()).toContain("หน้าแรก");
    expect(wrapper.text()).toContain("v.1.0.0");
  });

  it("should render SubHeader with breadcrumbs", () => {
    const wrapper = createWrapper();
    expect(wrapper.findComponent({ name: "VBreadcrumbs" }).exists()).toBe(true);
  });

  it("should render the default slot content inside v-main", () => {
    const wrapper = createWrapper();
    expect(wrapper.find("#page-slot").exists()).toBe(true);
    expect(wrapper.text()).toContain("page content");
  });

  it("should call toggleCollapse when the SideBar collapse button is clicked", async () => {
    const wrapper = createWrapper();
    await wrapper.find("#collapse-button").trigger("click");
    expect(mockToggleCollapse).toHaveBeenCalled();
  });

  it("should call navigateToRoute when a SideBar menu item is clicked", async () => {
    const wrapper = createWrapper();
    const menuItems = wrapper.findAll("#menu-item");
    await menuItems[0].trigger("click");
    expect(mockNavigateToRoute).toHaveBeenCalledWith("/menu", true);
  });

  it("should hide organization/user-info sections in AppBar on mobile", () => {
    mockUseDisplay.mockReturnValue({ smAndDown: ref(true) });
    const wrapper = createWrapper();
    expect(wrapper.text()).not.toContain("สำนักบริหารการทะเบียน");
  });
});
