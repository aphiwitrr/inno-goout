import type { AppError } from "~/types";

// ── FetchError Shape ────────────────────────────────
interface FetchErrorShape {
  response?: { status?: number; };
  data?: {
    message?: string;
    errorMessage?: string;
  };
  message?: string;
}

// ── Error Normalizer ────────────────────────────────
// แปลง error ทุกรูปแบบให้เป็น AppError ที่ app ใช้ได้ทุกที่
export const normalizeError = (raw: unknown): AppError => {
  // $fetch error shape (FetchError from ofetch)
  if (raw && typeof raw === "object" && "response" in raw) {
    const fetchErr = raw as FetchErrorShape;
    const status = fetchErr.response?.status ?? 0;
    return {
      status,
      message: fetchErr.data?.errorMessage
        ?? fetchErr.data?.message
        ?? fetchErr.message
        ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      code: `HTTP_${status}`,
    };
  }

  // native Error
  if (raw instanceof Error) {
    return {
      message: raw.message,
      code: "UNKNOWN",
    };
  }

  return {
    message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    code: "UNKNOWN",
  };
};

// ── isAppError ──────────────────────────────────────
// type guard — เช็คว่า unknown เป็น AppError (ต้องมี code ด้วย เพื่อแยกจาก native Error)
export const isAppError = (err: unknown): err is AppError => {
  if (err === null || typeof err !== "object") return false;
  // FetchError (ofetch) มี response property — ไม่ใช่ AppError ต้องผ่าน normalizeError
  if ("response" in err) return false;
  const obj = err as Record<string, unknown>;
  return typeof obj.message === "string"
    && ("code" in obj || "status" in obj);
};

// ── Error Handler Composable ────────────────────────
export const useErrorHandler = () => {
  const { $swal } = useNuxtApp();

  // จัดการ side-effect ตาม status code แล้ว throw AppError กลับไป
  const handleError = async (err: unknown): Promise<never> => {
    const appError = isAppError(err)
      ? err
      : normalizeError(err);

    if (appError.status === 401) {
      await $swal?.fire({
        title: "Token หมดอายุ",
        text: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        icon: "error",
        showCancelButton: true,
        showConfirmButton: false,
      });
      location.replace(`${location.origin}/login`);
      // throw ทันทีหลัง redirect เพื่อหยุด execution ไม่ให้ flash UI error
      throw appError;
    }

    const status = appError.status ?? 0;

    if (status >= 400 && status < 500) {
      await $swal?.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: appError.message,
      });
    }
    else if (status >= 500) {
      await $swal?.fire({
        title: "เกิดข้อผิดพลาด",
        text: appError.message,
        icon: "error",
      });
    }
    else {
      await $swal?.fire({
        title: "ไม่สามารถเชื่อมต่อได้",
        text: "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต",
        icon: "error",
      });
    }

    throw appError;
  };

  // silent version — normalize แล้ว return ไม่ throw ไม่แสดง swal
  const silentError = (err: unknown): AppError => {
    return isAppError(err)
      ? err
      : normalizeError(err);
  };

  return {
    handleError,
    silentError,
    normalizeError,
    isAppError,
  };
};
