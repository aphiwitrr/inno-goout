import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useBaseRepository } from "~/repositories/base.repository";

const {
  mockUseErrorHandler,
  mock$Fetch,
} = vi.hoisted(() => ({
  mockUseErrorHandler: vi.fn(),
  mock$Fetch: vi.fn().mockResolvedValue({}),
}));

mockNuxtImport("useErrorHandler", () => mockUseErrorHandler);
vi.stubGlobal("$fetch", mock$Fetch);

describe("useBaseRepository", () => {
  let mockHandleError: ReturnType<typeof vi.fn>;
  let mockSilentError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHandleError = vi.fn().mockRejectedValue({ message: "error", code: "ERR" });
    mockSilentError = vi.fn().mockReturnValue({ message: "silent error", code: "ERR" });

    mockUseErrorHandler.mockReturnValue({
      handleError: mockHandleError,
      silentError: mockSilentError,
    });

    mock$Fetch.mockReset();
  });

  describe("request", () => {
    it("should call $fetch with default GET method", async () => {
      mock$Fetch.mockResolvedValue({ data: "ok" });

      const { request } = useBaseRepository();
      const result = await request("/test");

      expect(mock$Fetch).toHaveBeenCalledWith("/test", {
        baseURL: "/",
        method: "GET",
        params: undefined,
        body: undefined,
      });
      expect(result).toEqual({ data: "ok" });
    });

    it("should pass method, params, and body to $fetch", async () => {
      mock$Fetch.mockResolvedValue({ success: true });

      const { request } = useBaseRepository();
      await request("/users", {
        baseURL: "/",
        method: "POST",
        params: { page: "1" },
        body: { name: "test" },
      });

      expect(mock$Fetch).toHaveBeenCalledWith("/users", {
        baseURL: "/",
        method: "POST",
        params: { page: "1" },
        body: { name: "test" },
      });
    });

    it("should call handleError when $fetch throws", async () => {
      const fetchError = new Error("Network error");
      mock$Fetch.mockRejectedValue(fetchError);

      const { request } = useBaseRepository();

      await expect(request("/fail")).rejects.toBeDefined();
      expect(mockHandleError).toHaveBeenCalledWith(fetchError);
    });

    it("should throw silentError instead of calling handleError when silent is true", async () => {
      const fetchError = new Error("Network error");
      mock$Fetch.mockRejectedValue(fetchError);

      const { request } = useBaseRepository();

      await expect(request("/fail", { silent: true })).rejects.toEqual({
        message: "silent error",
        code: "ERR",
      });
      expect(mockSilentError).toHaveBeenCalledWith(fetchError);
      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should call request with GET method", async () => {
      mock$Fetch.mockResolvedValue([]);

      const { get } = useBaseRepository();
      await get("/users");

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        method: "GET",
      }));
    });

    it("should build query params from QueryParams", async () => {
      mock$Fetch.mockResolvedValue([]);

      const { get } = useBaseRepository();
      await get("/users", { page: 1, search: "test", sort: "" });

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        params: { page: "1", search: "test" },
      }));
    });

    it("should pass undefined params when no QueryParams given", async () => {
      mock$Fetch.mockResolvedValue([]);

      const { get } = useBaseRepository();
      await get("/users");

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        params: undefined,
      }));
    });

    it("should filter out null and undefined from QueryParams", async () => {
      mock$Fetch.mockResolvedValue([]);

      const { get } = useBaseRepository();
      await get("/users", { page: 1, search: null, sort: undefined } as any);

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        params: { page: "1" },
      }));
    });

    it("should return undefined params when all QueryParams values are empty", async () => {
      mock$Fetch.mockResolvedValue([]);

      const { get } = useBaseRepository();
      await get("/users", { search: "", sort: "" });

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        params: undefined,
      }));
    });

    it("should convert number 0 to string in QueryParams", async () => {
      mock$Fetch.mockResolvedValue([]);

      const { get } = useBaseRepository();
      await get("/users", { page: 0 });

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        params: { page: "0" },
      }));
    });
  });

  describe("post", () => {
    it("should call request with POST method and body", async () => {
      mock$Fetch.mockResolvedValue({ id: 1 });

      const { post } = useBaseRepository();
      await post("/users", { name: "John" });

      expect(mock$Fetch).toHaveBeenCalledWith("/users", expect.objectContaining({
        method: "POST",
        body: { name: "John" },
      }));
    });
  });

  describe("put", () => {
    it("should call request with PUT method and body", async () => {
      mock$Fetch.mockResolvedValue({ id: 1 });

      const { put } = useBaseRepository();
      await put("/users/1", { name: "Updated" });

      expect(mock$Fetch).toHaveBeenCalledWith("/users/1", expect.objectContaining({
        method: "PUT",
        body: { name: "Updated" },
      }));
    });
  });

  describe("del", () => {
    it("should call request with DELETE method", async () => {
      mock$Fetch.mockResolvedValue(null);

      const { del } = useBaseRepository();
      await del("/users/1");

      expect(mock$Fetch).toHaveBeenCalledWith("/users/1", expect.objectContaining({
        method: "DELETE",
      }));
    });
  });
});
