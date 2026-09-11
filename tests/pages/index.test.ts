import { describe, it, expect } from "vitest";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";
import IndexPage from "../../app/pages/index.vue";

describe("pages/index.vue", () => {
  it("should mount the page without error", () => {
    const wrapper = mountWithVuetify(IndexPage);
    expect(wrapper).toBeDefined();
  });

  it("should render the main content", () => {
    const wrapper = mountWithVuetify(IndexPage);
    expect(wrapper.text()).toContain("index");
  });
});
