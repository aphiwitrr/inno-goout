import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useExampleRepository } from "~/repositories/example.repository";

const { mockUseBaseRepository } = vi.hoisted(() => ({
  mockUseBaseRepository: vi.fn(),
}));

mockNuxtImport("useBaseRepository", () => mockUseBaseRepository);

describe("useExampleRepository", () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockPost: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockGet = vi.fn();
    mockPost = vi.fn();
    mockUseBaseRepository.mockReturnValue({ get: mockGet, post: mockPost });
    vi.clearAllMocks();
  });

  describe("getExamples", () => {
    it("should call get with /examples endpoint", async () => {
      const mockResponse = { data: [], status: 200 };
      mockGet.mockResolvedValue(mockResponse);

      const { getExamples } = useExampleRepository();
      const result = await getExamples();

      expect(mockGet).toHaveBeenCalledWith("/examples", undefined, undefined);
      expect(result).toEqual(mockResponse);
    });

    it("should pass QueryParams to get", async () => {
      const mockResponse = { data: [], status: 200 };
      mockGet.mockResolvedValue(mockResponse);

      const { getExamples } = useExampleRepository();
      await getExamples({ page: 1, search: "test" });

      expect(mockGet).toHaveBeenCalledWith("/examples", { page: 1, search: "test" }, undefined);
    });
  });

  describe("getExampleById", () => {
    it("should call get with /examples/:id endpoint", async () => {
      const mockResponse = { data: { user_id: 1 }, status: 200 };
      mockGet.mockResolvedValue(mockResponse);

      const { getExampleById } = useExampleRepository();
      const result = await getExampleById(1);

      expect(mockGet).toHaveBeenCalledWith("/examples/1", undefined, undefined);
      expect(result).toEqual(mockResponse);
    });

    it("should handle different ids", async () => {
      mockGet.mockResolvedValue({ data: null, status: 200 });

      const { getExampleById } = useExampleRepository();
      await getExampleById(999);

      expect(mockGet).toHaveBeenCalledWith("/examples/999", undefined, undefined);
    });
  });

  describe("createExample", () => {
    it("should call post with /examples endpoint and body", async () => {
      const body = { full_name: "John", email: "j@test.com", role: "admin" };
      const mockResponse = { data: { user_id: 1, ...body }, status: 201 };
      mockPost.mockResolvedValue(mockResponse);

      const { createExample } = useExampleRepository();
      const result = await createExample(body);

      expect(mockPost).toHaveBeenCalledWith("/examples", body, undefined);
      expect(result).toEqual(mockResponse);
    });

    it("should pass silent flag through to post", async () => {
      const body = { full_name: "Jane", email: "jane@test.com", role: "user" };
      mockPost.mockResolvedValue({ data: null, status: 201 });

      const { createExample } = useExampleRepository();
      await createExample(body, true);

      expect(mockPost).toHaveBeenCalledWith("/examples", body, true);
    });
  });
});
