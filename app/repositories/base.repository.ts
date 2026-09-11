import type { RequestOptions, QueryParams } from "~/types";

// ── Query Builder ───────────────────────────────────
// แปลง QueryParams → Record<string, string> สำหรับ query params
const buildQuery = (params?: QueryParams): Record<string, string> | undefined => {
  if (!params) return undefined;

  const query: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query[key] = String(value);
    }
  }

  return Object.keys(query).length > 0 ? query : undefined;
};

// ── Base Repository ─────────────────────────────────
// หมายเหตุ: default แสดง $swal error ให้อัตโนมัติผ่าน useErrorHandler().handleError
// ถ้า composable ต้องการจัดการ error เอง (เช่น custom message, ไม่อยากโชว์ dialog ซ้ำ)
// ให้ส่ง silent: true เพื่อใช้ silentError แทน (normalize เฉยๆ ไม่แสดง dialog)
export const useBaseRepository = () => {
  const { handleError, silentError } = useErrorHandler();

  const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
    try {
      return await $fetch<T>(url, {
        baseURL: "/",
        method: options?.method ?? "GET",
        params: options?.params,
        body: options?.body as Record<string, unknown> | undefined,
      });
    }
    catch (err) {
      if (options?.silent) throw silentError(err);
      return await handleError(err);
    }
  };

  const get = <T>(url: string, params?: QueryParams, silent?: boolean) =>
    request<T>(url, { method: "GET", params: buildQuery(params), silent });

  const post = <T>(url: string, body?: unknown, silent?: boolean) =>
    request<T>(url, { method: "POST", body, silent });

  const put = <T>(url: string, body?: unknown, silent?: boolean) =>
    request<T>(url, { method: "PUT", body, silent });

  const del = <T>(url: string, silent?: boolean) =>
    request<T>(url, { method: "DELETE", silent });

  return { request, get, post, put, del };
};
