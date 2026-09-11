import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, ref } from "vue";
import { VLayout } from "vuetify/components";
import { mountWithVuetify } from "../helpers/mount-with-vuetify";
import AppBar from "~/components/AppBar.vue";

const mockUseDisplay = vi.fn();

vi.mock("vuetify", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vuetify")>();
  return {
    ...actual,
    useDisplay: () => mockUseDisplay(),
  };
});

const defaultProps = {
  programName: "ระบบทดสอบ",
  userName: "สมชาย",
  workplace: "[001] - สำนักงาน",
};

// Wrapper เพื่อให้ Vuetify inject layout ได้
const createWrapper = (props: Record<string, unknown> = defaultProps) => {
  const WrapperComponent = defineComponent({
    components: { VLayout, AppBar },
    template: `<v-layout><AppBar v-bind="$attrs" /></v-layout>`,
  });
  return mountWithVuetify(WrapperComponent, { attrs: props });
};

describe("AppBar.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDisplay.mockReturnValue({ smAndDown: ref(false) });
  });

  describe("desktop (smAndDown=false)", () => {
    it("should render programName in the center title", () => {
      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).toContain("ระบบทดสอบ");
    });

    it("should render organization name section", () => {
      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).toContain("สำนักบริหารการทะเบียน");
      expect(wrapper.text()).toContain("กรมการปกครอง");
    });

    it("should render workplace and userName in the user info section", () => {
      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).toContain("[001] - สำนักงาน");
      expect(wrapper.text()).toContain("สมชาย");
    });

    it("should default userName and workplace to empty string when not provided", () => {
      const wrapper = createWrapper({ programName: "ระบบทดสอบ" });
      expect(wrapper.text()).toContain("ผู้ปฏิบัติงาน");
    });
  });

  describe("mobile (smAndDown=true)", () => {
    beforeEach(() => {
      mockUseDisplay.mockReturnValue({ smAndDown: ref(true) });
    });

    it("should hide organization name section", () => {
      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).not.toContain("สำนักบริหารการทะเบียน");
    });

    it("should hide user info section", () => {
      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).not.toContain("ผู้ปฏิบัติงาน");
    });

    it("should still render programName in the center title", () => {
      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).toContain("ระบบทดสอบ");
    });
  });

  describe("reactive display changes", () => {
    it("should show/hide organization name when viewport changes", async () => {
      const smAndDown = ref(false);
      mockUseDisplay.mockReturnValue({ smAndDown });

      const wrapper = createWrapper(defaultProps);
      expect(wrapper.text()).toContain("สำนักบริหารการทะเบียน");

      smAndDown.value = true;
      await wrapper.vm.$nextTick();
      expect(wrapper.text()).not.toContain("สำนักบริหารการทะเบียน");
    });
  });
});
