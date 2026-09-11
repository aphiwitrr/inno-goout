import { describe, it, expect, vi } from "vitest";
import { ref, defineComponent } from "vue";
import { VLayout } from "vuetify/components";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";

vi.mock("@vueuse/core", () => ({
  useNow: () => ref(new Date("2024-01-15T10:30:00")),
}));

import SubHeader from "~/components/SubHeader.vue";

// Wrapper component ที่มี VLayout ครอบ เพื่อให้ Vuetify inject layout ได้
const SubHeaderWrapper = defineComponent({
  components: { VLayout, SubHeader },
  props: { breadcrumbsItem: { type: Array, default: () => [] } },
  template: `<v-layout><SubHeader :breadcrumbs-item="breadcrumbsItem" /></v-layout>`,
});

describe("components/SubHeader.vue", () => {
  it("should mount the component without error", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper);
    expect(wrapper).toBeDefined();
  });

  it("should render the breadcrumbs component", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper, {
      props: { breadcrumbsItem: [{ title: "Home", href: "/" }] },
    });
    expect(wrapper.findComponent({ name: "VBreadcrumbs" }).exists()).toBe(true);
  });

  it("should render date label text", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper);
    expect(wrapper.text()).toContain("วันที่");
  });

  it("should render suffix น.", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper);
    expect(wrapper.text()).toContain("น.");
  });

  it("should use v-app-bar component", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper);
    const appBar = wrapper.findComponent({ name: "VAppBar" });
    expect(appBar.exists()).toBe(true);
  });

  it("should have flat prop on v-app-bar", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper);
    const appBar = wrapper.findComponent({ name: "VAppBar" });
    expect(appBar.props("flat")).toBe(true);
  });

  it("should set height to 40", () => {
    const wrapper = mountWithVuetify(SubHeaderWrapper);
    const appBar = wrapper.findComponent({ name: "VAppBar" });
    expect(appBar.props("height")).toBe("50");
  });
});
