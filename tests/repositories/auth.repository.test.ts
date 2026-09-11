import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useAuthRepository } from "~/repositories/auth.repository";

const { mockUseBaseRepository } = vi.hoisted(() => ({
  mockUseBaseRepository: vi.fn(),
}));

mockNuxtImport("useBaseRepository", () => mockUseBaseRepository);

describe("useAuthRepository", () => {
  let mockGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    mockUseBaseRepository.mockReturnValue({ get: mockGet });
    vi.clearAllMocks();
  });

  describe("getLoginInfo", () => {
    it("should call get with /api/sso/login/v1/info", async () => {
      const mockData = { user: { firstName: "John" }, boraEmployee: { id: "1" } };
      mockGet.mockResolvedValue(mockData);

      const { getLoginInfo } = useAuthRepository();
      const result = await getLoginInfo();

      expect(mockGet).toHaveBeenCalledWith("/api/sso/login/v1/info");
      expect(result).toEqual(mockData);
    });

    it("should propagate error from base repository", async () => {
      const error = { message: "Unauthorized", code: "HTTP_401", status: 401 };
      mockGet.mockRejectedValue(error);

      const { getLoginInfo } = useAuthRepository();

      await expect(getLoginInfo()).rejects.toEqual(error);
    });
  });
});
