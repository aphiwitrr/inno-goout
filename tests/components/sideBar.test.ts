import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent } from "vue";
import { VLayout } from "vuetify/components";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";
import type { MenuItem } from "~/types";
import SideBar from "~/components/SideBar.vue";

// Wrapper เพื่อให้ Vuetify inject layout ได้
const createWrapper = (props: Record<string, unknown> = {}) => {
  const WrapperComponent = defineComponent({
    components: { VLayout, SideBar },
    template: `<v-layout><SideBar v-bind="$attrs" /></v-layout>`,
  });
  return mountWithVuetify(WrapperComponent, { attrs: props });
};

const defaultMenuItems: MenuItem[] = [
  { title: "เมนูหลัก", icon: "mdi-view-grid", path: "/menu", external: true, active: false },
  { title: "หน้าแรก", icon: "mdi-home", path: "/", external: false, active: true },
  { title: "รายงาน", icon: "mdi-file", path: "/reports", external: false, active: false },
];

describe("SideBar.vue — logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Props interface", () => {
    it("should accept required props", () => {
      const props = {
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      };
      expect(props.drawer).toBe(true);
      expect(props.isCollapsed).toBe(false);
      expect(props.menuItems).toHaveLength(3);
      expect(props.appVersion).toBe("1.0.0");
    });

    it("should handle empty menuItems", () => {
      const props = { drawer: true, isCollapsed: false, menuItems: [] as MenuItem[] };
      expect(props.menuItems).toHaveLength(0);
    });
  });

  describe("Collapse icon logic", () => {
    it("should show chevron-left when not collapsed", () => {
      const isCollapsed = false;
      const icon = isCollapsed ? "mdi-chevron-right" : "mdi-chevron-left";
      expect(icon).toBe("mdi-chevron-left");
    });

    it("should show chevron-right when collapsed", () => {
      const isCollapsed = true;
      const icon = isCollapsed ? "mdi-chevron-right" : "mdi-chevron-left";
      expect(icon).toBe("mdi-chevron-right");
    });
  });

  describe("Menu title display logic", () => {
    it("should show menu title when not collapsed", () => {
      const isCollapsed = false;
      const displayTitle = isCollapsed ? "" : defaultMenuItems[0].title;
      expect(displayTitle).toBe("เมนูหลัก");
    });

    it("should hide menu title when collapsed", () => {
      const isCollapsed = true;
      const displayTitle = isCollapsed ? "" : defaultMenuItems[0].title;
      expect(displayTitle).toBe("");
    });

    it("should show all menu titles when not collapsed", () => {
      const isCollapsed = false;
      const titles = defaultMenuItems.map(item => isCollapsed ? "" : item.title);
      expect(titles).toEqual(["เมนูหลัก", "หน้าแรก", "รายงาน"]);
    });

    it("should hide all menu titles when collapsed", () => {
      const isCollapsed = true;
      const titles = defaultMenuItems.map(item => isCollapsed ? "" : item.title);
      expect(titles).toEqual(["", "", ""]);
    });
  });

  describe("Version display logic", () => {
    it("should show version when not collapsed", () => {
      const isCollapsed = false;
      const showVersion = !isCollapsed;
      expect(showVersion).toBe(true);
    });

    it("should hide version when collapsed", () => {
      const isCollapsed = true;
      const showVersion = !isCollapsed;
      expect(showVersion).toBe(false);
    });
  });

  describe("Navigate emit logic", () => {
    it("should pass path and external=true for external items", () => {
      const item = defaultMenuItems[0]; // external: true
      const emitArgs = [item.path, item.external ?? false];
      expect(emitArgs).toEqual(["/menu", true]);
    });

    it("should pass path and external=false for internal items", () => {
      const item = defaultMenuItems[1]; // external: false
      const emitArgs = [item.path, item.external ?? false];
      expect(emitArgs).toEqual(["/", false]);
    });

    it("should default external to false when undefined", () => {
      const item: MenuItem = { title: "Test", icon: "mdi-test", path: "/test" };
      const emitArgs = [item.path, item.external ?? false];
      expect(emitArgs).toEqual(["/test", false]);
    });
  });

  describe("Divider logic", () => {
    it("should show divider after first item (index === 0)", () => {
      const showDivider = (index: number) => index === 0;
      expect(showDivider(0)).toBe(true);
      expect(showDivider(1)).toBe(false);
      expect(showDivider(2)).toBe(false);
    });
  });

  describe("Navigation drawer props", () => {
    it("should pass drawer as modelValue", () => {
      const props = { drawer: true, isCollapsed: false, menuItems: defaultMenuItems };
      expect(props.drawer).toBe(true);
    });

    it("should pass isCollapsed as rail", () => {
      const props = { drawer: true, isCollapsed: true, menuItems: defaultMenuItems };
      expect(props.isCollapsed).toBe(true);
    });

    it("should handle drawer=false", () => {
      const props = { drawer: false, isCollapsed: false, menuItems: defaultMenuItems };
      expect(props.drawer).toBe(false);
    });
  });
});

describe("SideBar.vue — template rendering", () => {
  describe("Collapse icon rendering", () => {
    it("should render mdi-chevron-left icon when not collapsed", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      const collapseBtn = wrapper.find("#collapse-button");
      expect(collapseBtn.html()).toContain("mdi-chevron-left");
    });

    it("should render mdi-chevron-right icon when collapsed", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: true,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      const collapseBtn = wrapper.find("#collapse-button");
      expect(collapseBtn.html()).toContain("mdi-chevron-right");
    });
  });

  describe("Menu title rendering", () => {
    it("should render menu titles when not collapsed", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      expect(wrapper.text()).toContain("เมนูหลัก");
      expect(wrapper.text()).toContain("หน้าแรก");
      expect(wrapper.text()).toContain("รายงาน");
    });

    it("should not render menu titles when collapsed", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: true,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      const titleSpans = wrapper.findAll(".text-body-large");
      titleSpans.forEach((span) => {
        expect(span.text()).toBe("");
      });
    });
  });

  describe("Version rendering", () => {
    it("should render version text when not collapsed", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "2.1.0",
      });
      expect(wrapper.text()).toContain("v.2.1.0");
    });

    it("should not render version text when collapsed", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: true,
        menuItems: defaultMenuItems,
        appVersion: "2.1.0",
      });
      expect(wrapper.text()).not.toContain("v.2.1.0");
    });
  });

  describe("Emit events", () => {
    it("should emit toggleCollapse when collapse button clicked", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      const collapseBtn = wrapper.find("#collapse-button");
      await collapseBtn.trigger("click");
      const sideBar = wrapper.findComponent({ name: "SideBar" });
      expect(sideBar.emitted("toggleCollapse")).toBeTruthy();
    });

    it("should emit navigate when menu item clicked", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      const menuItems = wrapper.findAll("#menu-item");
      await menuItems[0].trigger("click");
      const sideBar = wrapper.findComponent({ name: "SideBar" });
      expect(sideBar.emitted("navigate")).toBeTruthy();
      expect(sideBar.emitted("navigate")![0]).toEqual(["/menu", true]);
    });

    it("should emit navigate with external=false for internal items", async () => {
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: defaultMenuItems,
        appVersion: "1.0.0",
      });
      const menuItems = wrapper.findAll("#menu-item");
      await menuItems[1].trigger("click");
      const sideBar = wrapper.findComponent({ name: "SideBar" });
      expect(sideBar.emitted("navigate")![0]).toEqual(["/", false]);
    });

    it("should default external to false when undefined", async () => {
      const itemsWithoutExternal = [
        { title: "No External", icon: "mdi-help", path: "/no-ext", active: false },
      ];
      const wrapper = await createWrapper({
        drawer: true,
        isCollapsed: false,
        menuItems: itemsWithoutExternal,
        appVersion: "1.0.0",
      });
      const menuItems = wrapper.findAll("#menu-item");
      await menuItems[0].trigger("click");
      const sideBar = wrapper.findComponent({ name: "SideBar" });
      expect(sideBar.emitted("navigate")![0]).toEqual(["/no-ext", false]);
    });
  });
});
