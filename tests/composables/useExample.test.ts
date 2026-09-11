import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, computed } from "vue";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { useExample } from "~/composables/useExample";

const {
  mockUseExampleRepository,
  mockUseAuthentication,
  mockUseLoginInfo,
  mockUseNuxtApp,
  mockCreatePdfToDataUrl,
  mockPrintDoc,
} = vi.hoisted(() => ({
  mockUseExampleRepository: vi.fn(),
  mockUseAuthentication: vi.fn(),
  mockUseLoginInfo: vi.fn(),
  mockUseNuxtApp: vi.fn(),
  mockCreatePdfToDataUrl: vi.fn(),
  mockPrintDoc: vi.fn(),
}));

mockNuxtImport("useExampleRepository", () => mockUseExampleRepository);
mockNuxtImport("useAuthentication", () => mockUseAuthentication);
mockNuxtImport("useLoginInfo", () => mockUseLoginInfo);
mockNuxtImport("useNuxtApp", () => mockUseNuxtApp);

vi.mock("@cdglib/js-pdfmake", () => ({
  createPdfToDataUrl: mockCreatePdfToDataUrl,
  printDoc: mockPrintDoc,
}));

vi.mock("~/printouts/example", () => ({
  default: vi.fn((data: unknown) => ({ content: [], _data: data })),
}));

describe("useExample", () => {
  let mockGetExamples: ReturnType<typeof vi.fn>;
  let mockCreateExample: ReturnType<typeof vi.fn>;
  let mockSwalFire: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetExamples = vi.fn();
    mockCreateExample = vi.fn();
    mockSwalFire = vi.fn().mockResolvedValue({ isConfirmed: true });

    mockUseNuxtApp.mockReturnValue({
      $swal: { fire: mockSwalFire },
    });

    mockUseExampleRepository.mockReturnValue({
      getExamples: mockGetExamples,
      createExample: mockCreateExample,
    });

    mockUseAuthentication.mockReturnValue({
      getUserName: computed(() => "สมชาย ใจดี"),
    });

    mockUseLoginInfo.mockReturnValue(ref({
      boraEmployee: {
        workplace: { code: "001", description: "สำนักงานทดสอบ" },
      },
    }));

    mockCreatePdfToDataUrl.mockResolvedValue("data:application/pdf;base64,xxx");
  });

  describe("initial state", () => {
    it("should initialize with empty examples array", () => {
      const { examples } = useExample();
      expect(examples.value).toEqual([]);
    });

    it("should initialize with loading false", () => {
      const { loading } = useExample();
      expect(loading.value).toBe(false);
    });

    it("should initialize with error null", () => {
      const { error } = useExample();
      expect(error.value).toBeNull();
    });
  });

  describe("fetchExamples", () => {
    it("should set loading true during fetch", async () => {
      let loadingDuringFetch = false;
      mockGetExamples.mockImplementation(async () => {
        loadingDuringFetch = true;
        return { data: [] };
      });

      const { fetchExamples, loading } = useExample();

      const promise = fetchExamples();
      expect(loading.value).toBe(true);

      await promise;
      expect(loading.value).toBe(false);
      expect(loadingDuringFetch).toBe(true);
    });

    it("should clear error before fetch", async () => {
      mockGetExamples
        .mockRejectedValueOnce({ message: "fail", code: "ERR" })
        .mockResolvedValueOnce({ data: [] });

      const { fetchExamples, error } = useExample();

      await fetchExamples();
      expect(error.value).not.toBeNull();

      await fetchExamples();
      expect(error.value).toBeNull();
    });

    it("should map DTO to domain model", async () => {
      mockGetExamples.mockResolvedValue({
        data: [
          { user_id: 1, full_name: "John", email: "j@test.com", role: "admin", created_at: "2025-01-01" },
          { user_id: 2, full_name: "Jane", email: "jane@test.com", role: "user", created_at: "2025-02-01" },
        ],
      });

      const { fetchExamples, examples } = useExample();
      await fetchExamples();

      expect(examples.value).toEqual([
        { id: 1, name: "John", email: "j@test.com", role: "admin", createdAt: "2025-01-01" },
        { id: 2, name: "Jane", email: "jane@test.com", role: "user", createdAt: "2025-02-01" },
      ]);
    });

    it("should pass QueryParams to repository", async () => {
      mockGetExamples.mockResolvedValue({ data: [] });

      const { fetchExamples } = useExample();
      await fetchExamples({ page: 2, search: "test" });

      expect(mockGetExamples).toHaveBeenCalledWith({ page: 2, search: "test" });
    });

    it("should not update examples when data is null", async () => {
      mockGetExamples.mockResolvedValue({ data: null });

      const { fetchExamples, examples } = useExample();
      await fetchExamples();

      expect(examples.value).toEqual([]);
    });

    it("should set error on failure", async () => {
      const appError = { message: "Server error", code: "HTTP_500", status: 500 };
      mockGetExamples.mockRejectedValue(appError);

      const { fetchExamples, error } = useExample();
      await fetchExamples();

      expect(error.value).toEqual(appError);
    });

    it("should set loading false after error", async () => {
      mockGetExamples.mockRejectedValue({ message: "fail", code: "ERR" });

      const { fetchExamples, loading } = useExample();
      await fetchExamples();

      expect(loading.value).toBe(false);
    });
  });

  describe("createExample", () => {
    const payload = { name: "John", email: "j@test.com", role: "admin" };

    it("should ask for confirmation before saving", async () => {
      const { createExample } = useExample();
      await createExample(payload);

      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "ยืนยันการบันทึก", icon: "question" }),
      );
    });

    it("should not call repository when confirmation is cancelled", async () => {
      mockSwalFire.mockResolvedValueOnce({ isConfirmed: false });

      const { createExample } = useExample();
      await createExample(payload);

      expect(mockCreateExample).not.toHaveBeenCalled();
    });

    it("should call repository with mapped DTO and silent=true when confirmed", async () => {
      mockCreateExample.mockResolvedValue({ data: { user_id: 1 } });

      const { createExample } = useExample();
      await createExample(payload);

      expect(mockCreateExample).toHaveBeenCalledWith(
        { full_name: "John", email: "j@test.com", role: "admin" },
        true,
      );
    });

    it("should show success dialog and refetch examples on success", async () => {
      mockCreateExample.mockResolvedValue({ data: { user_id: 1 } });
      mockGetExamples.mockResolvedValue({ data: [] });

      const { createExample } = useExample();
      await createExample(payload);

      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "บันทึกสำเร็จ", icon: "success" }),
      );
      expect(mockGetExamples).toHaveBeenCalled();
    });

    it("should not show success dialog when data is null", async () => {
      mockCreateExample.mockResolvedValue({ data: null });

      const { createExample } = useExample();
      await createExample(payload);

      expect(mockSwalFire).not.toHaveBeenCalledWith(
        expect.objectContaining({ title: "บันทึกสำเร็จ" }),
      );
    });

    it("should set error and show error dialog on failure", async () => {
      mockCreateExample.mockRejectedValue({ message: "save failed", code: "ERR" });

      const { createExample, error } = useExample();
      await createExample(payload);

      expect(error.value).not.toBeNull();
      expect(mockSwalFire).toHaveBeenCalledWith(
        expect.objectContaining({ title: "ไม่สามารถบันทึกข้อมูลได้", icon: "error" }),
      );
    });

    it("should set loading true during save and false after completion", async () => {
      let loadingDuringSave = false;
      mockCreateExample.mockImplementation(async () => {
        loadingDuringSave = loading.value;
        return { data: { user_id: 1 } };
      });
      mockGetExamples.mockResolvedValue({ data: [] });

      const { createExample, loading } = useExample();
      await createExample(payload);

      expect(loadingDuringSave).toBe(true);
      expect(loading.value).toBe(false);
    });
  });

  describe("onPrint", () => {
    it("should call createPdfToDataUrl with generated layout", async () => {
      const { onPrint } = useExample();
      await onPrint();

      expect(mockCreatePdfToDataUrl).toHaveBeenCalledWith(
        expect.objectContaining({ content: [] }),
        expect.objectContaining({
          pageMargins: [10, 90, 30, 70],
          defaultStyle: { fontSize: 16 },
        }),
      );
    });

    it("should call printDoc with pdf result", async () => {
      const { onPrint } = useExample();
      await onPrint();

      expect(mockPrintDoc).toHaveBeenCalledWith("data:application/pdf;base64,xxx");
    });

    it("should pass workplace from loginInfo to layout", async () => {
      const generateLayout = (await import("~/printouts/example")).default as ReturnType<typeof vi.fn>;

      const { onPrint } = useExample();
      await onPrint();

      expect(generateLayout).toHaveBeenCalledWith(
        expect.objectContaining({
          workPlace: "สำนักงานทดสอบ",
        }),
      );
    });

    it("should pass getUserName to layout", async () => {
      const generateLayout = (await import("~/printouts/example")).default as ReturnType<typeof vi.fn>;

      const { onPrint } = useExample();
      await onPrint();

      expect(generateLayout).toHaveBeenCalledWith(
        expect.objectContaining({
          boraEmployeeName: "สมชาย ใจดี",
        }),
      );
    });

    it("should pass currentDate in Thai format", async () => {
      const generateLayout = (await import("~/printouts/example")).default as ReturnType<typeof vi.fn>;

      const { onPrint } = useExample();
      await onPrint();

      const callData = generateLayout.mock.calls[0][0];
      // Thai date format should contain Thai month name
      expect(callData.currentDate).toMatch(/\d{2}\s.+\s\d{4}/);
    });

    it("should handle missing workplace gracefully", async () => {
      mockUseLoginInfo.mockReturnValue(ref(null));

      const generateLayout = (await import("~/printouts/example")).default as ReturnType<typeof vi.fn>;

      const { onPrint } = useExample();
      await onPrint();

      expect(generateLayout).toHaveBeenCalledWith(
        expect.objectContaining({
          workPlace: "",
        }),
      );
    });
  });
});
