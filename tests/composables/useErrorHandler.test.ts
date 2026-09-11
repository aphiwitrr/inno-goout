import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from "vitest";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { normalizeError, isAppError, useErrorHandler } from "~/composables/useErrorHandler";

const { mockUseNuxtApp } = vi.hoisted(() => ({
  mockUseNuxtApp: vi.fn(),
}));

mockNuxtImport("useNuxtApp", () => mockUseNuxtApp);

// Mock location
const originalLocation = globalThis.location;
beforeAll(() => {
  Object.defineProperty(globalThis, "location", {
    value: { origin: "http://localhost", replace: vi.fn() } as unknown as Location,
    configurable: true,
  });
});
afterAll(() => {
  Object.defineProperty(globalThis, "location", {
    value: originalLocation,
    configurable: true,
  });
});

describe("normalizeError", () => {
  it("should normalize FetchError with response status", () => {
    const fetchError = {
      response: { status: 404 },
      data: { errorMessage: "Not found" },
      message: "fetch failed",
    };
    const result = normalizeError(fetchError);
    expect(result).toEqual({
      status: 404,
      message: "Not found",
      code: "HTTP_404",
    });
  });

  it("should use data.message when errorMessage is missing", () => {
    const fetchError = {
      response: { status: 500 },
      data: { message: "Internal error" },
    };
    const result = normalizeError(fetchError);
    expect(result.message).toBe("Internal error");
    expect(result.code).toBe("HTTP_500");
  });

  it("should use top-level message as fallback", () => {
    const fetchError = {
      response: { status: 503 },
      message: "Service unavailable",
    };
    const result = normalizeError(fetchError);
    expect(result.message).toBe("Service unavailable");
  });

  it("should use default message when no message found", () => {
    const fetchError = {
      response: { status: 0 },
    };
    const result = normalizeError(fetchError);
    expect(result.message).toBe("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
  });

  it("should default status to 0 when response has no status", () => {
    const fetchError = {
      response: {},
      data: { errorMessage: "Something failed" },
    };
    const result = normalizeError(fetchError);
    expect(result.status).toBe(0);
    expect(result.code).toBe("HTTP_0");
    expect(result.message).toBe("Something failed");
  });

  it("should default status to 0 when response is undefined", () => {
    const fetchError = {
      response: undefined,
      message: "Network timeout",
    };
    const result = normalizeError(fetchError);
    expect(result.status).toBe(0);
    expect(result.code).toBe("HTTP_0");
    expect(result.message).toBe("Network timeout");
  });

  it("should normalize native Error", () => {
    const error = new Error("Something went wrong");
    const result = normalizeError(error);
    expect(result).toEqual({
      message: "Something went wrong",
      code: "UNKNOWN",
    });
  });

  it("should handle unknown error types", () => {
    const result = normalizeError("string error");
    expect(result).toEqual({
      message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      code: "UNKNOWN",
    });
  });

  it("should handle null", () => {
    const result = normalizeError(null);
    expect(result.code).toBe("UNKNOWN");
  });

  it("should handle undefined", () => {
    const result = normalizeError(undefined);
    expect(result.code).toBe("UNKNOWN");
  });
});

describe("isAppError", () => {
  it("should return true for valid AppError with code", () => {
    const err = { message: "error", code: "HTTP_404" };
    expect(isAppError(err)).toBe(true);
  });

  it("should return true for valid AppError with status", () => {
    const err = { message: "error", status: 500 };
    expect(isAppError(err)).toBe(true);
  });

  it("should return true for AppError with both code and status", () => {
    const err = { message: "error", code: "HTTP_500", status: 500 };
    expect(isAppError(err)).toBe(true);
  });

  it("should return false for native Error (no code/status)", () => {
    const err = new Error("native error");
    expect(isAppError(err)).toBe(false);
  });

  it("should return false for FetchError-like object with response property", () => {
    const err = {
      message: "[GET] /api/test: 404 Not Found",
      response: { status: 404 },
      data: { errorMessage: "ไม่มีข้อมูล" },
    };
    expect(isAppError(err)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isAppError(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isAppError(undefined)).toBe(false);
  });

  it("should return false for string", () => {
    expect(isAppError("error")).toBe(false);
  });

  it("should return false for number", () => {
    expect(isAppError(42)).toBe(false);
  });

  it("should return false for object without message", () => {
    expect(isAppError({ code: "ERR" })).toBe(false);
  });

  it("should return false for object with non-string message", () => {
    expect(isAppError({ message: 123, code: "ERR" })).toBe(false);
  });
});

describe("useErrorHandler", () => {
  let mockSwalFire: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSwalFire = vi.fn().mockResolvedValue({});
    mockUseNuxtApp.mockReturnValue({
      $swal: { fire: mockSwalFire },
    });
    vi.clearAllMocks();
  });

  describe("handleError", () => {
    it("should show swal warning for 4xx errors and throw", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Bad request", code: "HTTP_400", status: 400 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", title: "แจ้งเตือน" }),
      );
    });

    it("should show swal error for 5xx errors and throw", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Server error", code: "HTTP_500", status: 500 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", title: "เกิดข้อผิดพลาด" }),
      );
    });

    it("should show swal and redirect for 401 errors", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Unauthorized", code: "HTTP_401", status: 401 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Token หมดอายุ" }),
      );
      expect(location.replace).toHaveBeenCalledWith("http://localhost/login");
    });

    it("should show network error swal for unknown status", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Unknown", code: "UNKNOWN" };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "ไม่สามารถเชื่อมต่อได้" }),
      );
    });

    it("should show network error swal for status 0", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "No connection", code: "HTTP_0", status: 0 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "ไม่สามารถเชื่อมต่อได้" }),
      );
    });

    it("should show network error for error without status", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "timeout", code: "TIMEOUT" };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "ไม่สามารถเชื่อมต่อได้" }),
      );
    });

    it("should normalize raw error before handling", async () => {
      const { handleError } = useErrorHandler();
      const rawError = new Error("Network failed");

      await expect(handleError(rawError)).rejects.toMatchObject({
        message: "Network failed",
        code: "UNKNOWN",
      });
    });

    it("should normalize FetchError before handling", async () => {
      const { handleError } = useErrorHandler();
      const fetchError = {
        response: { status: 403 },
        data: { errorMessage: "Forbidden" },
      };

      await expect(handleError(fetchError)).rejects.toMatchObject({
        status: 403,
        message: "Forbidden",
        code: "HTTP_403",
      });
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning" }),
      );
    });
  });

  describe("silentError", () => {
    it("should return AppError without showing swal", () => {
      const { silentError } = useErrorHandler();
      const error = { message: "Silent", code: "HTTP_500", status: 500 };

      const result = silentError(error);
      expect(result).toEqual(error);
      expect(mockSwalFire).not.toHaveBeenCalled();
    });

    it("should normalize raw error without showing swal", () => {
      const { silentError } = useErrorHandler();
      const rawError = new Error("Something broke");

      const result = silentError(rawError);
      expect(result).toEqual({ message: "Something broke", code: "UNKNOWN" });
      expect(mockSwalFire).not.toHaveBeenCalled();
    });

    it("should normalize FetchError without showing swal", () => {
      const { silentError } = useErrorHandler();
      const fetchError = {
        response: { status: 404 },
        data: { errorMessage: "Not found" },
      };

      const result = silentError(fetchError);
      expect(result).toEqual({ status: 404, message: "Not found", code: "HTTP_404" });
      expect(mockSwalFire).not.toHaveBeenCalled();
    });
  });

  describe("handleError — status boundary cases", () => {
    it("should show warning for status 400 (lower bound of 4xx)", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Bad Request", code: "HTTP_400", status: 400 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", title: "แจ้งเตือน" }),
      );
    });

    it("should show warning for status 402", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Payment Required", code: "HTTP_402", status: 402 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", title: "แจ้งเตือน" }),
      );
    });

    it("should show warning for status 403", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Forbidden", code: "HTTP_403", status: 403 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", title: "แจ้งเตือน" }),
      );
    });

    it("should show warning for status 404", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Not Found", code: "HTTP_404", status: 404 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", title: "แจ้งเตือน" }),
      );
    });

    it("should show warning for status 499 (upper bound of 4xx)", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Client Closed", code: "HTTP_499", status: 499 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "warning", title: "แจ้งเตือน" }),
      );
    });

    it("should show error for status 500 (lower bound of 5xx)", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Internal Server Error", code: "HTTP_500", status: 500 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", title: "เกิดข้อผิดพลาด" }),
      );
    });

    it("should show error for status 502", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Bad Gateway", code: "HTTP_502", status: 502 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", title: "เกิดข้อผิดพลาด" }),
      );
    });

    it("should show error for status 503", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Service Unavailable", code: "HTTP_503", status: 503 };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ icon: "error", title: "เกิดข้อผิดพลาด" }),
      );
    });

    it("should show network error for status undefined", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Unknown", code: "UNKNOWN", status: undefined };

      await expect(handleError(error)).rejects.toEqual(error);
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "ไม่สามารถเชื่อมต่อได้" }),
      );
    });

    it("should redirect for 401 before reaching 4xx block", async () => {
      const { handleError } = useErrorHandler();
      const error = { message: "Unauthorized", code: "HTTP_401", status: 401 };

      await expect(handleError(error)).rejects.toEqual(error);
      // Should show Token expired, NOT warning
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Token หมดอายุ" }),
      );
      expect(mockSwalFire).not.toHaveBeenCalledWith(
        expect.objectContaining({ title: "แจ้งเตือน" }),
      );
    });

    it("should always throw AppError regardless of status", async () => {
      const { handleError } = useErrorHandler();

      const cases = [
        { message: "a", code: "HTTP_400", status: 400 },
        { message: "b", code: "HTTP_401", status: 401 },
        { message: "c", code: "HTTP_500", status: 500 },
        { message: "d", code: "UNKNOWN" },
      ];

      for (const error of cases) {
        await expect(handleError(error)).rejects.toMatchObject({ message: error.message });
      }
    });
  });
});
