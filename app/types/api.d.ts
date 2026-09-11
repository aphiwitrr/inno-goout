// ── API Response ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// ── Error System ────────────────────────────────────
export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

// ── Request Options ─────────────────────────────────
export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  params?: Record<string, string>;
  body?: unknown;
  // true = normalize error เงียบๆ ไม่แสดง $swal (default = false, แสดง $swal ให้อัตโนมัติ)
  silent?: boolean;
}

// ── Query Builder ───────────────────────────────────
export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  [key: string]: unknown;
}
