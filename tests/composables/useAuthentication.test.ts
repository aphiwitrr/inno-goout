import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import type { Ref } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useAuthentication } from "~/composables/useAuthentication";
import type { LoginInfoType } from "~/types";

const {
  mockUseNuxtApp,
  mockUseLoadingIndicator,
  mockUseLoginInfo,
  mockNavigateTo,
  mockUseAuthRepository,
} = vi.hoisted(() => ({
  mockUseNuxtApp: vi.fn(),
  mockUseLoadingIndicator: vi.fn(),
  mockUseLoginInfo: vi.fn(),
  mockNavigateTo: vi.fn(),
  mockUseAuthRepository: vi.fn(),
}));

mockNuxtImport("useNuxtApp", () => mockUseNuxtApp);
mockNuxtImport("useLoadingIndicator", () => mockUseLoadingIndicator);
mockNuxtImport("useLoginInfo", () => mockUseLoginInfo);
mockNuxtImport("navigateTo", () => mockNavigateTo);
mockNuxtImport("useAuthRepository", () => mockUseAuthRepository);

describe("useAuthentication", () => {
  let mockStart: ReturnType<typeof vi.fn>;
  let mockFinish: ReturnType<typeof vi.fn>;
  let mockSwalFire: ReturnType<typeof vi.fn>;
  let mockGetLoginInfo: ReturnType<typeof vi.fn>;
  let loginInfoRef: Ref<LoginInfoType | null>;

  beforeEach(() => {
    mockStart = vi.fn();
    mockFinish = vi.fn();
    mockSwalFire = vi.fn().mockResolvedValue({});
    mockGetLoginInfo = vi.fn();
    loginInfoRef = ref(null);

    mockUseNuxtApp.mockReturnValue({
      $swal: { fire: mockSwalFire },
    });

    mockUseAuthRepository.mockReturnValue({
      getLoginInfo: mockGetLoginInfo,
    });

    mockUseLoadingIndicator.mockReturnValue({
      start: mockStart,
      finish: mockFinish,
    });

    mockUseLoginInfo.mockReturnValue(loginInfoRef);
    mockNavigateTo.mockResolvedValue(undefined);

    vi.clearAllMocks();
  });

  describe("getLoginInfo", () => {
    it("should export getLoginInfo function", () => {
      const auth = useAuthentication();
      expect(auth.getLoginInfo).toBeDefined();
    });

    it("should call start and finish on getLoginInfo", async () => {
      mockGetLoginInfo.mockResolvedValue({
        boraEmployee: { id: "1" },
        user: {},
      });

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(mockStart).toHaveBeenCalled();
      expect(mockFinish).toHaveBeenCalled();
    });

    it("should call start and finish even on error", async () => {
      mockGetLoginInfo.mockRejectedValue({ message: "API Error", code: "HTTP_500", status: 500 });

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(mockStart).toHaveBeenCalled();
      expect(mockFinish).toHaveBeenCalled();
    });

    it("should call repository getLoginInfo", async () => {
      mockGetLoginInfo.mockResolvedValue({
        boraEmployee: { id: "1" },
        user: {},
      });

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(mockGetLoginInfo).toHaveBeenCalled();
    });

    it("should set login info when boraEmployee exists", async () => {
      const data = {
        boraEmployee: { id: "1" },
        user: { firstName: "John", lastName: "Doe" },
      };
      mockGetLoginInfo.mockResolvedValue(data);

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(loginInfoRef.value).toEqual(data);
      expect(mockSwalFire).not.toHaveBeenCalled();
      expect(mockNavigateTo).not.toHaveBeenCalled();
    });

    it("should show alert and navigate when boraEmployee is null", async () => {
      mockGetLoginInfo.mockResolvedValue({
        boraEmployee: null,
        user: { firstName: "Jane", lastName: "Smith" },
      });

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(mockSwalFire).toHaveBeenCalledWith({
        title: "ยังไม่ได้เลือกสถานที่ทำงาน",
        text: "กรุณาเลือกสถานที่ทำงานก่อนใช้งานระบบ",
        icon: "warning",
        showCancelButton: true,
        showConfirmButton: false,
      });
      expect(mockNavigateTo).toHaveBeenCalledWith("/");
    });

    it("should show alert and navigate when boraEmployee is undefined", async () => {
      mockGetLoginInfo.mockResolvedValue({
        boraEmployee: undefined,
        user: { firstName: "Jane", lastName: "Smith" },
      });

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(mockSwalFire).toHaveBeenCalled();
      expect(mockNavigateTo).toHaveBeenCalledWith("/");
    });

    it("should not set login info when response is null", async () => {
      mockGetLoginInfo.mockResolvedValue(null);

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(loginInfoRef.value).toBeNull();
      expect(mockSwalFire).not.toHaveBeenCalled();
      expect(mockNavigateTo).not.toHaveBeenCalled();
    });

    it("should set error when API throws", async () => {
      const appError = { message: "Network error", code: "HTTP_500", status: 500 };
      mockGetLoginInfo.mockRejectedValue(appError);

      const { getLoginInfo, error } = useAuthentication();
      await getLoginInfo();

      expect(error.value).toEqual(appError);
      expect(loginInfoRef.value).toBeNull();
    });

    it("should clear error on new request", async () => {
      mockGetLoginInfo
        .mockRejectedValueOnce({ message: "fail", code: "ERR" })
        .mockResolvedValueOnce({ boraEmployee: { id: "1" }, user: {} });

      const { getLoginInfo, error } = useAuthentication();

      await getLoginInfo();
      expect(error.value).not.toBeNull();

      await getLoginInfo();
      expect(error.value).toBeNull();
    });

    it("should still set loginInfo even when boraEmployee is null/falsy", async () => {
      const data = {
        boraEmployee: null,
        user: { firstName: "Test", lastName: "User" },
      };
      mockGetLoginInfo.mockResolvedValue(data);

      const { getLoginInfo } = useAuthentication();
      await getLoginInfo();

      expect(loginInfoRef.value).toEqual(data);
    });
  });

  describe("getUserName", () => {
    it("should export getUserName computed property", () => {
      const auth = useAuthentication();
      expect(auth.getUserName).toBeDefined();
    });

    it("should return empty string when loginInfo is null", () => {
      const auth = useAuthentication();
      expect(auth.getUserName?.value).toBe("");
    });

    it("should return formatted name when user data exists", () => {
      loginInfoRef.value = {
        user: {
          title: {
            titleSex: "M",
            description: {
              thai: { shortPrint: "Mr." },
            },
          },
          sex: 1,
          firstName: "John",
          middleName: "Paul",
          lastName: "Doe",
        },
      };

      const auth = useAuthentication();
      expect(typeof auth.getUserName?.value).toBe("string");
    });

    it("should handle missing title information", () => {
      loginInfoRef.value = {
        user: {
          title: null,
          sex: 1,
          firstName: "Jane",
          middleName: "Marie",
          lastName: "Smith",
        },
      };

      const auth = useAuthentication();
      expect(typeof auth.getUserName?.value).toBe("string");
    });

    it("should handle missing user data", () => {
      loginInfoRef.value = {};

      const auth = useAuthentication();
      expect(auth.getUserName?.value).toBe(" -");
    });

    it("should be reactive to loginInfo changes", () => {
      const auth = useAuthentication();
      expect(auth.getUserName?.value).toBe("");

      loginInfoRef.value = {
        user: {
          title: {
            titleSex: "F",
            description: {
              thai: { shortPrint: "Ms." },
            },
          },
          sex: 0,
          firstName: "Alice",
          middleName: "",
          lastName: "Johnson",
        },
      };

      expect(typeof auth.getUserName?.value).toBe("string");
    });
  });

  describe("workplace", () => {
    it("should export workplace computed property", () => {
      const auth = useAuthentication();
      expect(auth.workplace).toBeDefined();
    });

    it("should return empty string when loginInfo is null", () => {
      const auth = useAuthentication();
      expect(auth.workplace?.value).toBe("");
    });

    it("should return empty string when boraEmployee or workplace is missing", () => {
      loginInfoRef.value = { boraEmployee: null };
      const auth = useAuthentication();
      expect(auth.workplace?.value).toBe("");

      loginInfoRef.value = { boraEmployee: { workplace: null } };
      expect(auth.workplace?.value).toBe("");
    });

    it("should return formatted workplace string when data exists", () => {
      loginInfoRef.value = {
        boraEmployee: {
          workplace: {
            code: "001",
            description: "Main Office",
          },
        },
      };

      const auth = useAuthentication();
      expect(auth.workplace?.value).toBe("[001] - Main Office");
    });
  });

  describe("error", () => {
    it("should expose error ref", () => {
      const auth = useAuthentication();
      expect(auth.error).toBeDefined();
      expect(auth.error.value).toBeNull();
    });
  });
});
