Boilerplate AI Prompt Guide

สำหรับสร้าง feature ใหม่ตาม architecture ปัจจุบัน
ทุก step มี code จริงจาก project เป็น reference

Follow strictly.

===================================================
PART 1: Foundation
===================================================

Step 1: Nuxt Config

- SSR disabled (SPA mode)
- Vuetify auto-import via vite-plugin-vuetify
- runtimeConfig.public สำหรับ app metadata
- ESLint stylistic enabled
- Proxy /api ไปยัง backend (ผ่าน APP_BASE_URL)

Example:

export default defineNuxtConfig({
  modules: ["@nuxt/eslint"],
  ssr: false,
  imports: { dirs: ["repositories"] },
  runtimeConfig: {
    public: {
      appVersion: process.env.NUXT_APP_VERSION || "1.0.0",
      systemName: process.env.NUXT_APP_SYSTEM_NAME || "",
      programName: process.env.NUXT_APP_PROGRAM_NAME || "",
    },
  },
  build: {
    transpile: ["vuetify"],
  },
})

---

Step 2: Plugins

- 01.vuetify.ts — Vuetify + MDI icons + Thai/English locale
- 02.sweetalert2.ts — SweetAlert2 mixin inject เป็น $swal

Rules:
- ใช้ defineNuxtPlugin
- Vuetify theme colors กำหนดที่ plugin
- $swal มี default confirmButtonText/cancelButtonText เป็นภาษาไทย

---

Step 3: Type Augmentation (nuxt.d.ts)

- declare module "#app" เพื่อ type $swal
- ไม่มี $api (ลบ axios แล้ว ใช้ $fetch)

Example:

import type { Swal } from "sweetalert2"

declare module "#app" {
  interface NuxtApp {
    $swal: Swal
  }
}

---

Step 4: Global State (composables/states.ts)

- ใช้ useState สำหรับ shared state
- Export เป็น composable function

Example:

export const useLoginInfo = () =>
  useState<LoginInfoType | null>("loginInfo", () => null)

---

Step 5: App Shell (app.vue)

- v-app wrapper
- NuxtLoadingIndicator
- LoadingOverlay component
- NuxtLayout + NuxtPage

===================================================
PART 2: Type System
===================================================

Step 6: API Types (types/api.d.ts)

- AppError — error type กลาง (ใช้ทั้ง app)
- RequestOptions — typed request options
- QueryParams — query builder interface

Example:

interface AppError {
  message: string
  code?: string
  status?: number
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE"
  params?: Record<string, string>
  body?: unknown
}

interface QueryParams {
  search?: string
  sort?: string
  [key: string]: unknown
}

---

Step 7: Entity Types (types/xxx.d.ts)

- ชื่อ type ต้องลงท้ายด้วย "Type" เสมอ (เช่น UserType, OrderType, LoginInfoType)
- DTO pick จาก API response ตรงๆ (camelCase เหมือน JSON ที่ได้จาก API)
- Domain Model เป็น shape ที่ app ใช้
- DTO ไม่ต้อง define ทุก field — pick เฉพาะ field ที่ app ใช้จริง
- ถ้า API response มี 20 fields แต่ app ใช้แค่ 5 → DTO มีแค่ 5
- เนื่องจาก API response เป็น camelCase อยู่แล้ว DTO กับ Domain Model มักจะ shape เหมือนกัน
- ถ้า shape เหมือนกัน ใช้ type เดียวได้เลย (ไม่ต้องแยก DTO / Domain)
- แยก DTO กับ Domain Model เฉพาะเมื่อต้อง rename field (เช่น fullName → name)

Naming Convention:
- Entity type: XxxType (เช่น UserType, OrderType)
- DTO type (ถ้าแยก): XxxDTOType (เช่น UserDTOType)

Example (shape เหมือนกัน — ใช้ type เดียว):

interface UserType {
  userId: number
  fullName: string
  email: string
  role: string
  createdAt: string
}

Example (ต้อง rename — แยก DTO + Domain):

interface UserDTOType {
  userId: number
  fullName: string
  email: string
  role: string
  createdAt: string
}

interface UserType {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

---

Step 8: Barrel Export (types/index.d.ts)

- re-export ทุก type file จากที่เดียว
- import ใช้ "~/types" เสมอ

Example:

export * from "./login-info"
export * from "./layout"
export * from "./api"
export * from "./example"

===================================================
PART 3: Error System (composables/useErrorHandler.ts)
===================================================

Error system เป็น composable กลาง แยกออกจาก repository
ใครก็ import ไปใช้ได้ — ทั้ง repository, composable, page

---

Step 9: normalizeError() — Pure Function

- แปลง error ทุกรูปแบบให้เป็น AppError
- รองรับ: FetchError (ofetch), native Error, unknown
- export เป็น standalone function (ใช้นอก composable ได้)

Example:

export const normalizeError = (raw: unknown): AppError => {
  // $fetch error (FetchError from ofetch)
  if (raw && typeof raw === "object" && "response" in raw) {
    const fetchErr = raw as FetchErrorShape
    const status = fetchErr.response?.status ?? 0
    return {
      status,
      message: fetchErr.data?.errorMessage
        ?? fetchErr.data?.message
        ?? fetchErr.message
        ?? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      code: `HTTP_${status}`,
    }
  }

  // native Error
  if (raw instanceof Error) {
    return { message: raw.message, code: "UNKNOWN" }
  }

  return { message: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ", code: "UNKNOWN" }
}

---

Step 10: isAppError() — Type Guard

- เช็คว่า unknown เป็น AppError หรือไม่
- ต้องมี "code" หรือ "status" ด้วย เพื่อแยกจาก native Error
- export เป็น standalone function

Example:

export const isAppError = (err: unknown): err is AppError => {
  if (err === null || typeof err !== "object") return false
  const obj = err as Record<string, unknown>
  return typeof obj.message === "string"
    && ("code" in obj || "status" in obj)
}

---

Step 11: useErrorHandler() — Composable

- handleError() — แสดง swal ตาม status แล้ว throw AppError
- silentError() — normalize แล้ว return ไม่ throw ไม่แสดง swal
- ต้องเรียกใน setup context (ใช้ useNuxtApp ข้างใน)

handleError() behavior:
- 401 → swal error + redirect /login + throw ทันที (หยุด execution ก่อน redirect)
- 4xx → swal warning + throw
- 5xx → swal error + throw
- default (network/unknown) → swal เช็คอินเทอร์เน็ต + throw
- throw AppError เสมอ

Example:

export const useErrorHandler = () => {
  const { $swal } = useNuxtApp()

  const handleError = async (err: unknown): Promise<never> => {
    const appError = isAppError(err)
      ? err
      : normalizeError(err)

    if (appError.status === 401) {
      await $swal?.fire({ title: "Token หมดอายุ", icon: "error", ... })
      location.replace(`${location.origin}/login`)
      throw appError  // throw ทันทีหลัง redirect
    }

    if ((appError.status ?? 0) >= 400 && (appError.status ?? 0) < 500) {
      await $swal?.fire({ icon: "warning", title: "แจ้งเตือน", ... })
    } else if ((appError.status ?? 0) >= 500) {
      await $swal?.fire({ title: "เกิดข้อผิดพลาด", icon: "error", ... })
    } else {
      await $swal?.fire({ title: "ไม่สามารถเชื่อมต่อได้", icon: "error", ... })
    }

    throw appError
  }

  const silentError = (err: unknown): AppError => {
    return isAppError(err)
      ? err
      : normalizeError(err)
  }

  return { handleError, silentError, normalizeError, isAppError }
}

---

Step 12: การใช้งาน Error System

ใน base repository (แสดง swal + throw):
  const { handleError } = useErrorHandler()
  catch (err) { return await handleError(err) }

ใน composable ที่ต้องการ silent (ไม่แสดง swal):
  const { silentError } = useErrorHandler()
  catch (err) { error.value = silentError(err) }

ใน composable ที่ให้ repository จัดการ swal แล้ว:
  catch (e) { error.value = e as AppError }

เช็ค type guard:
  if (isAppError(err)) { ... }

===================================================
PART 4: Repository Pattern
===================================================

Step 13: Query Builder — buildQuery()

- แปลง QueryParams → Record<string, string>
- กรอง null / undefined / "" ออกอัตโนมัติ
- อยู่ใน base.repository.ts (module-level function)

Example:

const buildQuery = (params?: QueryParams): Record<string, string> | undefined => {
  if (!params) return undefined

  const query: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query[key] = String(value)
    }
  }

  return Object.keys(query).length > 0 ? query : undefined
}

---

Step 14: Base Repository (repositories/base.repository.ts)

- ใช้ $fetch (Nuxt built-in, ofetch) — ไม่ใช้ axios
- error handling ผ่าน useErrorHandler().handleError
- request() เป็น core — try/catch + handleError
- HTTP helpers: get(), post(), put(), del()
- get() รับ QueryParams แล้วผ่าน buildQuery()

Example:

export const useBaseRepository = () => {
  const { handleError } = useErrorHandler()

  const request = async <T>(url: string, options?: RequestOptions): Promise<T> => {
    try {
      return await $fetch<T>(url, {
        method: options?.method ?? "GET",
        params: options?.params,
        body: options?.body,
      })
    }
    catch (err) {
      return await handleError(err)
    }
  }

  const get = <T>(url: string, params?: QueryParams) =>
    request<T>(url, { method: "GET", params: buildQuery(params) })

  const post = <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "POST", body })

  const put = <T>(url: string, body?: unknown) =>
    request<T>(url, { method: "PUT", body })

  const del = <T>(url: string) =>
    request<T>(url, { method: "DELETE" })

  return { request, get, post, put, del }
}

---

Step 15: Repository Implementation (repositories/xxx.repository.ts)

- MUST extend base repository ผ่าน useBaseRepository()
- ใช้ HTTP helpers (get, post, put, del) ไม่เรียก request() ตรง
- รับ QueryParams สำหรับ list endpoint

Example:

import type { QueryParams, UserDTOType } from "~/types"

export const useUserRepository = () => {
  const { get } = useBaseRepository()

  const getUsers = async (params?: QueryParams): Promise<UserDTOType[]> => {
    return await get<UserDTOType[]>("/users", params)
  }

  const getUserById = async (id: number): Promise<UserDTOType> => {
    return await get<UserDTOType>(`/users/${id}`)
  }

  return { getUsers, getUserById }
}

===================================================
PART 5: Composable Pattern
===================================================

Step 16: Domain Composable (composables/useXxx.ts)

Composable เป็นที่รวม logic ทั้งหมดของ feature:
- state management (ref, computed)
- data fetching (ผ่าน repository)
- data transformation
- business logic (validation, conditional, computed values)
- action handlers (onSearch, onSave, onDelete, etc.)
- UI state (loading, error, disabled, form values)

Page (.vue) ทำหน้าที่แค่ bind template กับ composable — ห้ามมี logic ใน page

เมื่อได้รับรูปหน้าจอ — ทุกปุ่มที่เห็นต้องมี function ใน composable:
- ปุ่ม "ค้นหา" → onSearch()
- ปุ่ม "บันทึก" → onSave()
- ปุ่ม "พิมพ์" → onPrint()
- ปุ่ม "ลบ" → removeItem(index) หรือ onDelete(id)
- ปุ่ม "ยกเลิก" → onCancel() หรือ onReset()
- ปุ่ม "แก้ไข" → onEdit(id)
- ปุ่ม "เพิ่ม" → onAdd()
- ปุ่ม "refresh" → fetchXxx()

MUST expose:
- data (ref)
- error (ref<AppError | null>)
- form state (ref) — ถ้ามี form
- disabled state (ref) — ถ้ามีปุ่มที่ต้อง disable
- action functions — ทุกปุ่มที่เห็นในรูปต้องมี function
- computed values (ถ้ามี)

MUST ใช้:
- repository — ห้ามเรียก $fetch ตรง
- useLoadingIndicator — สำหรับ loading state (ไม่ต้องสร้าง ref เอง)
- useErrorHandler — สำหรับ error ที่ต้อง silent

Example (search + CRUD page):

import type { UserType, AppError, QueryParams } from "~/types"

export const useUsers = () => {
  // ── State ─────────────────────────────────
  const users = ref<UserType[]>([])
  const error = ref<AppError | null>(null)
  const searchForm = ref({ search: "", region: "" })
  const disabled = ref({ save: true, print: true })

  // ── Dependencies ──────────────────────────
  const repo = useUserRepository()
  const { $swal } = useNuxtApp()
  const indicator = useLoadingIndicator()

  // ── Actions ───────────────────────────────
  const fetchUsers = async (params?: QueryParams) => {
    try {
      indicator.start()
      error.value = null
      const res = await repo.getUsers(params)
      if (res) {
        users.value = res
        disabled.value.save = users.value.length === 0
        disabled.value.print = users.value.length === 0
      }
    }
    catch (e) {
      error.value = e as AppError
    }
    finally {
      indicator.finish()
    }
  }

  const onSearch = () => fetchUsers(searchForm.value)

  const onSave = async () => {
    const confirm = await $swal?.fire({
      title: "ยืนยันการบันทึก?",
      icon: "question",
      showCancelButton: true,
      reverseButtons: true,
    })
    if (!confirm?.isConfirmed) return
    // ... save logic
  }

  const removeItem = (index: number) => {
    users.value.splice(index, 1)
    disabled.value.save = users.value.length === 0
  }

  // ── Return ────────────────────────────────
  return {
    users,
    error,
    searchForm,
    disabled,
    fetchUsers,
    onSearch,
    onSave,
    removeItem,
  }
}

---

Step 19: Form Validation Pattern

ก่อน submit (บันทึก/ส่ง) ต้อง validate form ใน composable เสมอ:
- ใช้ useTemplateRef<VForm>("formRef") เพื่อเข้าถึง form ref
- เรียก formRef.value?.validate() ก่อน action
- ถ้า validate ไม่ผ่าน → return ทันที ไม่ทำ action

Pattern:

import type { VForm } from "vuetify/components"

export const useXxx = () => {
  const formRef = useTemplateRef<VForm>("formRef")

  const onSave = async () => {
    // validate ก่อน
    const { valid } = await formRef.value!.validate()
    if (!valid) return

    // confirm
    const confirm = await $swal?.fire({
      title: "ยืนยันการบันทึก?",
      icon: "question",
      showCancelButton: true,
      reverseButtons: true,
    })
    if (!confirm?.isConfirmed) return

    // ... save logic
  }

  return { formRef, onSave, ... }
}

ใน Page (.vue):

<v-form ref="formRef" fast-fail>
  <!-- inputs with :rules -->
</v-form>

Rules:
- validate() อยู่ใน composable ไม่ใช่ page
- ใช้ useTemplateRef<VForm>("formRef") ใน composable
- Page แค่ใส่ ref="formRef" ใน v-form
- fast-fail ทำให้หยุด validate ทันทีที่เจอ error แรก
- Cross-field validation ใช้ :rules ที่อ้างอิง field อื่นผ่าน reactive form state

Example (cross-field validation):

const form = ref({ startDate: "", endDate: "" })

const endDateRules = [
  (v: string) => !!v || "กรุณาเลือกวันที่สิ้นสุด",
  (v: string) => !form.value.startDate || v >= form.value.startDate || "วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น",
]

===================================================
PART 6: Design System & Components
===================================================

เมื่อสร้างหน้าใหม่หรือ component ใหม่ ต้องปฏิบัติตาม conventions นี้
เพื่อให้ UI เป็น style เดียวกันทั้ง app

---

Step 20: Design System

Theme Colors (Vuetify):
- primary: #2E7D32 (เขียวเข้ม) — header, ปุ่มหลัก, active state
- secondary: rgba(237, 231, 246, 1) (ม่วงอ่อน) — chip, badge รอง
- error: #FF5252 — alert error, ปุ่มยกเลิก/ลบ
- warning: #FFC107 — alert warning
- info: #2196F3
- success: #4CAF50
- accent: #82B1FF

ใช้ชื่อ color ของ Vuetify เสมอ (color="primary") ห้ามใส่ hex ตรงใน template

Typography:
- Font: Bai Jamjuree (Thai font) — ตั้งค่าผ่าน Vuetify $body-font-family
- Font size root: 16px
- ใช้ Vuetify text classes (MD3): text-headline-small, text-title-large, text-body-large, text-body-medium, text-body-small, text-label-large
- Semi-bold: ใช้ class font-weight-semibold (custom) หรือ font-weight-bold

Icons:
- ใช้ Material Design Icons (mdi) เท่านั้น
- Format: mdi-xxx (เช่น mdi-refresh, mdi-magnify, mdi-content-save, mdi-printer)
- ใช้ผ่าน v-icon component หรือ prop icon="mdi-xxx" / prepend-icon="mdi-xxx"

Locale:
- Default locale: th (ภาษาไทย)
- Label, title, button text ทั้งหมดเป็นภาษาไทย
- SweetAlert2 default: ตกลง / ปิด

---

Step 21: Page Layout Pattern

โครงสร้างหน้า:

  <!-- Page Title -->
  <div class="text-headline-small font-weight-semibold mb-4">ชื่อหน้า</div>

  <!-- Form / Search Section -->
  <v-form ref="formRef" fast-fail>
    <v-row>
      <!-- form inputs -->
    </v-row>
  </v-form>

  <!-- Section Subtitle -->
  <div class="text-title-large font-weight-semibold mb-2 text-primary">ชื่อ section</div>

  <!-- Content (table) -->
  <v-sheet border rounded="lg">
    <v-table height="calc(100vh - 340px)" fixed-header>
      ...
    </v-table>
  </v-sheet>

Title:
- ใช้ <div class="text-headline-small font-weight-semibold mb-4"> เสมอ

Subtitle:
- ใช้ <div class="text-title-large font-weight-semibold mb-2 text-primary"> เสมอ
- เป็นหัวข้อแบ่ง section ภายในหน้า (เช่น "ผลการค้นหา", "รายละเอียด")
- สี text-primary

Rules:
- ไม่ต้องครอบ v-card ถ้าหน้ามี form + table แยก section
- ใช้ v-row + v-col สำหรับ grid layout

---

Step 22: Component Patterns

Error Alert:
  <v-alert v-if="error" type="error" variant="tonal" class="mb-4" closable>
    {{ error.message }}
  </v-alert>
- ใช้ variant="tonal" เสมอ
- ใส่ closable ให้ปิดได้
- วางก่อน content หลัก

Data Table:
- ใช้ v-sheet + v-table (ไม่ใช่ v-data-table)
- v-sheet ครอบนอก: border + rounded="lg"
- v-table ข้างใน: fixed-header + height="calc(100vh - 340px)"
- thead: bg-primary + text-white + text-body-large
- th แรก: rounded-s-lg, th สุดท้าย: rounded-e-lg (มุมโค้ง)
- td: text-center เสมอ
- คอลัมน์ลำดับ (::) ใช้ index + 1

Example:
  <v-sheet border rounded="lg">
    <v-table height="calc(100vh - 340px)" fixed-header>
      <thead>
        <tr class="text-white text-body-large">
          <th class="text-center bg-primary rounded-s-lg" scope="col">::</th>
          <th class="text-center bg-primary" scope="col">หมายเลข</th>
          <th class="text-center bg-primary" scope="col">สถานะ</th>
          <th class="text-center bg-primary rounded-e-lg" scope="col" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <td class="text-center">{{ index + 1 }}</td>
          <td class="text-center">{{ item.fieldA }}</td>
          <td class="text-center">{{ item.fieldB }}</td>
          <td class="text-center">
            <v-btn color="error" variant="outlined" rounded="lg"
              icon="mdi-trash-can-outline" density="comfortable"
              @click="removeItem(index)" />
          </td>
        </tr>
      </tbody>
    </v-table>
  </v-sheet>

Chips / Badges:
  <v-chip color="primary" size="small" label>{{ text }}</v-chip>
- ใช้ size="small" + label (สี่เหลี่ยม) เป็น default

Buttons:
- ทุกปุ่มใช้ rounded="lg" + color="primary" เป็น default
- Action หลัก (บันทึก, ยืนยัน): variant="flat" + color="primary"
- Action รอง (ค้นหา, พิมพ์): variant="outlined" + color="primary"
- Icon button: variant="text" + icon="mdi-xxx"
- Delete button: color="error" + variant="outlined"
- Loading state: ใช้ useLoadingIndicator() (indicator.start() / indicator.finish()) แทน :loading prop

Form Inputs:
- ใช้ Vuetify form components: v-text-field, v-select, v-autocomplete
- ใส่ label เป็นภาษาไทยเสมอ
- ทุก input ใส่: variant="outlined" density="compact" persistent-placeholder hide-details="auto" rounded="lg"
- Validation ใช้ :rules prop
- Form wrapper ใช้ v-form + fast-fail

Example (v-text-field):
  <v-text-field
    v-model="form.name"
    label="ชื่อ"
    variant="outlined"
    density="compact"
    persistent-placeholder
    hide-details="auto"
    rounded="lg"
    :rules="[v => !!v || 'กรุณากรอกชื่อ']"
  />

Display-Only Field (แสดงข้อมูลใน form ไม่ใช่การกรอก):
- ใช้ div + span ไม่ใช่ v-text-field readonly
- อยู่ใน v-row > v-col เหมือน form input
- label ใช้ text-body-medium text-grey
- value ใช้ text-body-large font-weight-bold

Example:
  <v-row>
    <v-col cols="12" md="3">
      <div class="d-flex flex-column">
        <span class="text-body-medium text-grey">จำนวนทั้งหมด</span>
        <span class="text-body-large font-weight-bold">{{ total }}</span>
      </div>
    </v-col>
    <v-col cols="12" md="3">
      <div class="d-flex flex-column">
        <span class="text-body-medium text-grey">สถานะ</span>
        <span class="text-body-large font-weight-bold">{{ status }}</span>
      </div>
    </v-col>
  </v-row>

SweetAlert2 ($swal):
- Confirm dialog: $swal.fire({ title, text, icon, showCancelButton: true, reverseButtons: true })
- reverseButtons: true เสมอ (ปุ่มยืนยันอยู่ขวา, ปุ่มยกเลิกอยู่ซ้าย)
- Success: icon: "success"
- Warning: icon: "warning"
- Error: icon: "error"
- ห้ามใช้ native alert() / confirm()

---

Step 23: Layout Structure

App Shell:
  v-app
  ├── NuxtLoadingIndicator
  ├── LoadingOverlay (blur backdrop)
  └── NuxtLayout (default)
      ├── AppBar.vue (primary, height=80, logo + title + user info)
      ├── SideBar.vue (collapsible sidebar, permanent)
      └── v-main
          ├── subheader layout (breadcrumbs + datetime)
          └── v-container fluid → slot (page content)

Component Pattern:
- default.vue เป็น orchestrator — ไม่มี template logic
- AppBar.vue รับ props: programName, userName, workplace
- SideBar.vue รับ props: drawer, isCollapsed, menuItems, appVersion
  - emit: @toggle-collapse, @navigate
- ใช้ props ลง, events ขึ้น (unidirectional data flow)

Navigation:
- Sidebar ใช้ v-navigation-drawer + v-list + v-list-item
- Breadcrumbs ใช้ v-breadcrumbs ใน subheader layout
- Active route highlight ผ่าน :active prop


===================================================
PART 7: Auth Composable Pattern
===================================================

Step 24: Auth Composable

useAuthentication ใช้ repository เหมือน domain composable อื่น:
- ใช้ useAuthRepository() สำหรับ API call
- error handling ผ่าน base repository (handleError + swal)
- business validation (เช่น เช็คสถานที่ทำงาน) ใช้ $swal ตรงได้ เพราะไม่ใช่ error handling

Pattern:
- ใช้ repository (ไม่ใช้ $fetch ตรง)
- catch block จับ error เป็น AppError
- business logic (เช็ค boraEmployee) อยู่ใน composable ไม่ใช่ repository

---

Step 25: Page (pages/xxx.vue)

Page ทำหน้าที่แค่ bind template กับ composable — ห้ามมี logic ใน page

Rules:
- script setup มีแค่ destructure จาก composable + define static data (headers, items list)
- ห้ามมี if/else, loop logic, async function, computed ใน page
- ห้ามเรียก repository / $fetch / $swal ตรงใน page
- ทุก action ต้องเรียก function จาก composable (onSearch, onSave, removeItem)
- v-alert bind กับ error จาก composable
- :disabled bind กับ disabled จาก composable

Example (page ที่ถูกต้อง):

<script setup lang="ts">
const {
  searchForm,
  items,
  error,
  disabled,
  onSearch,
  onSave,
  onPrint,
  removeItem,
} = useImproveCard()

// static data เท่านั้น
const regionItems = [
  { value: "1", title: "ศูนย์ภาค 1" },
  { value: "2", title: "ศูนย์ภาค 2" },
]

const headers = [
  { title: "::", key: "index" },
  { title: "ชื่อ", key: "name" },
]
</script>

ห้ามทำแบบนี้ใน page:

// ❌ ห้ามมี logic ใน page
const filteredItems = computed(() => items.value.filter(...))
const onCustomAction = async () => { await $fetch(...) }
if (someCondition) { ... }

===================================================
PART 8: Printout Pattern (PDF Generation)
===================================================

Step 26: Printout Layout (printouts/xxx.ts)

Printout เป็น pure function ที่รับ data แล้ว return TDocumentDefinitions (pdfmake)
- อยู่ใน folder printouts/
- ไม่มี side-effect, ไม่เรียก API, ไม่ใช้ composable
- รับ typed data object → return PDF layout
- ใช้ @cdglib/js-pdfmake สำหรับ createPdfToDataUrl + printDoc

Structure:
- helper functions (centeredCell, signatureBlock, fullWidthLine, etc.)
- buildBackground() → DynamicBackground
- buildHeader(data) → DynamicContent
- buildFooter(data) → DynamicContent
- buildContent(data) → Content
- export default function generateXxxReport(data): TDocumentDefinitions

Rules:
- ห้ามเรียก API / composable / ref ใน printout file
- ห้ามใช้ DOM API (document, window) — pdfmake ทำงานแบบ declarative
- data ที่ต้องใช้ต้องส่งเข้ามาผ่าน parameter (typed interface)
- type ของ data อยู่ใน types/ (เช่น types/printout.d.ts)

Example:

import type { TDocumentDefinitions } from "pdfmake/interfaces"
import type { MyReportData } from "~/types"

export default function generateMyReport(data: MyReportData): TDocumentDefinitions {
  return {
    background: buildBackground(),
    header: buildHeader(data),
    footer: buildFooter(data),
    content: [buildContent(data)],
    styles: { header: { fontSize: 18, bold: true } },
  }
}

---

Step 27: Printout ใน Composable

การพิมพ์เอกสารเป็น action ใน composable — ไม่ใช่ใน page:

const onPrint = async () => {
  const docData: MyReportData = {
    // รวบรวม data จาก state ใน composable
    currentDate: new Date().toLocaleDateString("th-TH", { ... }),
    items: items.value,
    ...
  }

  const pdfDoc = await createPdfToDataUrl(generateMyReport(docData), {
    pageMargins: [10, 90, 30, 70],
    defaultStyle: { fontSize: 16 },
  })

  printDoc(pdfDoc)
}

Rules:
- onPrint อยู่ใน composable (ไม่ใช่ page)
- รวบรวม data จาก refs/computed ใน composable
- เรียก printout function (pure) แล้วส่ง data เข้าไป
- ใช้ createPdfToDataUrl + printDoc จาก @cdglib/js-pdfmake

===================================================
PART 9: Rules Enforcement
===================================================

Step 28: MUST Rules

- MUST ใช้ $fetch (ไม่ใช้ axios)
- MUST ใช้ useErrorHandler() สำหรับ error handling
- MUST ใช้ base repository — ห้าม $fetch ตรงใน composable
- MUST type error เป็น AppError
- MUST แยก DTO กับ Domain Model
- MUST barrel export types ผ่าน index.d.ts
- MUST separate concerns: types → repository → composable → page
- MUST ใช้ v-sheet + v-table สำหรับ table (ไม่ใช่ v-data-table)
- MUST ให้ logic ทั้งหมดอยู่ใน composable (state, actions, computed, validation)
- MUST ให้ page เป็นแค่ template binding — ไม่มี logic

---

Step 29: MUST NOT Rules

- MUST NOT ใช้ axios หรือ library HTTP อื่น
- MUST NOT เรียก $fetch ตรงใน composable — ใช้ repository เสมอ
- MUST NOT ใช้ raw DTO ใน template
- MUST NOT ใส่ logic ใน page (computed, if/else, async function, $swal, $fetch)
- MUST NOT เรียก repository / $fetch / $swal ตรงใน page
- MUST NOT เขียน error handling ซ้ำ — ใช้ useErrorHandler() เสมอ
- MUST NOT import type จาก file ตรง — ใช้ "~/types" เสมอ
- MUST NOT ใช้ hex color ตรงใน template — ใช้ Vuetify color name
- MUST NOT ใช้ inline style — ใช้ Vuetify utility classes (d-flex, align-center, pa-4, mb-4)
- MUST NOT ใช้ icon library อื่นนอกจาก mdi
- MUST NOT ใช้ native HTML elements ที่ Vuetify มี component ให้ (เช่น ห้ามใช้ <button> ใช้ <v-btn>)
- MUST NOT เขียน custom CSS ถ้า Vuetify utility class ทำได้
- MUST NOT ใช้ alert() / confirm() — ใช้ $swal

===================================================
PART 10: Output Structure (สร้าง feature ใหม่)
===================================================

Step 30: เมื่อสร้าง entity ใหม่ ต้องสร้างไฟล์ตาม pattern นี้

/types/xxx.d.ts                  — DTO + Domain Model
/types/index.d.ts                — เพิ่ม export * from "./xxx"
/repositories/xxx.repository.ts  — extend base repository
/composables/useXxx.ts           — data + loading + error + fetch + onPrint
/pages/xxx.vue                   — UI with Vuetify
/printouts/xxx.ts                — PDF layout (ถ้ามีใบพิมพ์)
/types/printout.d.ts             — Printout data types (ถ้ามีใบพิมพ์)

Shared infrastructure (สร้างครั้งเดียว ใช้ทั้ง app):

/composables/useErrorHandler.ts  — normalizeError, isAppError, handleError, silentError
/repositories/base.repository.ts — $fetch wrapper + HTTP helpers
/types/api.d.ts                  — AppError, RequestOptions, QueryParams

===================================================
PART 11: UX & Layout Design
===================================================

Step 31: เมื่อผู้ใช้ส่งรูปหน้าจอมา ให้ออกแบบการจัดวางใหม่ให้ใช้งานง่ายขึ้น

วิเคราะห์รูปแล้วเสนอ layout ที่ดีกว่าเดิม โดยคิดจากมุม user flow:
- user ทำอะไรก่อน-หลัง
- สายตามองตรงไหน
- กดอะไรบ่อย
- อะไรที่ไม่จำเป็นต้องเห็นตลอด

---

Step 32: หลักการออกแบบ Layout

1. Group by task — จัดกลุ่ม element ตาม flow การทำงาน
   - ค้นหา → ผลลัพธ์ → action ต้องอยู่ใกล้กัน
   - input ที่เกี่ยวข้องกันอยู่ row เดียวกัน
   - ปุ่มที่ใช้คู่กัน (ค้นหา+ล้าง, บันทึก+ยกเลิก) อยู่ติดกัน

2. Reduce eye movement — ลดระยะสายตา
   - ปุ่ม action อยู่ใกล้ข้อมูลที่มันกระทำ
   - ไม่บังคับให้ user เลื่อนหน้าจอไปมา
   - ข้อมูลสำคัญอยู่ด้านบน, รายละเอียดอยู่ด้านล่าง
   - ปุ่มค้นหาอยู่ท้าย row ของ filter ไม่ใช่แยก row

3. Progressive disclosure — แสดงเท่าที่จำเป็น
   - ซ่อน field ที่ไม่จำเป็นต้องเห็นตลอด (ใช้ v-expand-transition)
   - filter ขั้นสูงซ่อนไว้ แสดงเมื่อกด "ตัวกรองเพิ่มเติม"
   - ข้อมูลรองใช้ tooltip หรือ expand row แทนการแสดงทั้งหมด

4. Clear visual hierarchy — ลำดับความสำคัญชัดเจน
   - Page title > Section subtitle > Content
   - Primary action โดดเด่นกว่า secondary (flat vs outlined)
   - ข้อมูลสำคัญ bold, ข้อมูลรอง text-grey + text-body-medium
   - แยก section ด้วย subtitle สี primary

5. Consistent flow direction — ทิศทางสม่ำเสมอ
   - อ่านซ้ายไปขวา, บนลงล่าง
   - ปุ่ม submit/save อยู่ขวาสุดเสมอ
   - ปุ่ม cancel/reset อยู่ซ้ายของ submit
   - ลำดับ: ค้นหา → ดูผล → เลือก → action

---

Step 33: UX Rules (บังคับใช้ทุกหน้า)

Form UX:
- จัดกลุ่ม input ที่เกี่ยวข้องกันไว้ใน row เดียวกัน
- ปุ่ม "ค้นหา" วางท้าย row เดียวกับ input (ไม่แยก row)
- ถ้า form มี field เดียว ให้ search ได้ด้วย Enter (type="submit")
- ใส่ placeholder ที่บอก format ที่ต้องการ (เช่น "XX-XXXXXXX-XX")
- Disabled state ชัดเจน — ปุ่มที่ยังใช้ไม่ได้ต้อง :disabled + tooltip บอกเหตุผล

Table UX:
- คอลัมน์ลำดับ (::) ให้แคบ width="60"
- คอลัมน์ action (ลบ/แก้ไข) ให้แคบ width="80"
- ถ้าไม่มีข้อมูล แสดง empty state (ข้อความ "ไม่พบข้อมูล" กลางตาราง)
- ถ้ามีข้อมูลเยอะ ให้ table scroll ได้ (fixed-header + height)

Action Buttons UX:
- ปุ่ม action หลัก (บันทึก) อยู่ขวาสุดเสมอ
- ปุ่ม action รอง (พิมพ์, ยกเลิก) อยู่ซ้ายของปุ่มหลัก
- ใช้ prepend-icon ให้ปุ่มอ่านง่ายขึ้น (mdi-content-save, mdi-printer, mdi-magnify)
- ปุ่มลบ/อันตราย ใช้ color="error" แยกชัดจากปุ่มปกติ
- ก่อน action ที่ย้อนกลับไม่ได้ (ลบ, บันทึก) ให้ confirm ด้วย $swal

Feedback UX:
- หลัง action สำเร็จ แสดง $swal success ทุกครั้ง
- หลัง action ล้มเหลว แสดง v-alert error (ไม่ใช่แค่ console)
- Loading state ใช้ useLoadingIndicator() — แสดง loading bar อัตโนมัติผ่าน LoadingOverlay
- ถ้า search ไม่เจอ แสดงข้อความ "ไม่พบข้อมูลที่ค้นหา" ไม่ใช่ตารางว่างเปล่า

---

Step 34: Layout Patterns ตาม Use Case

**หน้า List (ค้นหา + ตาราง):**
  Row 1: Page title .......................... [ปุ่มเพิ่มข้อมูล]
  Row 2: [input] [input] [dropdown] ......... [ปุ่มค้นหา]
  Row 3: Section subtitle "ผลการค้นหา (n รายการ)"
  Row 4: Table ผลลัพธ์
  Row 5: .......... [ปุ่มพิมพ์] [ปุ่มบันทึก]

**หน้า Form (กรอกข้อมูล):**
  Row 1: Page title
  Section 1 subtitle: "ข้อมูลหลัก"
  Row 2-4: inputs (2-3 col per row, จัดกลุ่มตามความเกี่ยวข้อง)
  Section 2 subtitle: "ข้อมูลเพิ่มเติม"
  Row 5-6: inputs รอง
  Bottom: .............. [ปุ่มยกเลิก] [ปุ่มบันทึก]

**หน้า Detail + รายการย่อย:**
  Row 1: Page title .......................... [ปุ่มแก้ไข]
  Section 1: ข้อมูลหลัก (display-only div>span, 3-4 col per row)
  Section 2 subtitle: "รายการ"
  Row: [input เพิ่มรายการ] .................. [ปุ่มเพิ่ม]
  Table: รายการย่อย (มีปุ่มลบแต่ละ row)
  Bottom: .............. [ปุ่มพิมพ์] [ปุ่มบันทึก]

**หน้า Dashboard / Summary:**
  Row 1: Page title
  Row 2: v-row > v-col (3-4 cards สรุปตัวเลข)
  Section subtitle: "รายละเอียด"
  Row 3: Table หรือ chart

---

Step 35: การปรับปรุงจากรูปที่พบบ่อย

ปัญหาที่พบบ่อยในรูปหน้าจอ + วิธีแก้:

| ปัญหา | วิธีปรับ |
|--------|----------|
| input เรียงแนวตั้งทั้งหมด | จัดเป็น v-row 2-3 col ให้กระชับ |
| ปุ่มค้นหาอยู่คนละ row | ย้ายมาท้าย row เดียวกับ input |
| ปุ่มอยู่ไกลจากข้อมูล | ย้ายมาใกล้ข้อมูลที่มันกระทำ |
| ไม่มี section แบ่ง | เพิ่ม subtitle แยก search/result/action |
| field แสดงผลใช้ input readonly | เปลี่ยนเป็น div>span |
| ตารางว่างไม่มีข้อความ | เพิ่ม empty state "ไม่พบข้อมูล" |
| ปุ่มไม่มี icon | เพิ่ม prepend-icon ให้อ่านง่าย |
| ปุ่มเรียงไม่มีลำดับ | จัด: รอง(ซ้าย) → หลัก(ขวา) |
| form ยาวเกินจอ | จัดกลุ่ม + ซ่อน field ไม่จำเป็น |
| ข้อมูลสำคัญไม่โดดเด่น | ใช้ font-weight-bold + ขนาดใหญ่ขึ้น |

---

Step 36: Response Format เมื่อออกแบบจากรูป

เมื่อผู้ใช้ส่งรูปมา ให้ตอบตามลำดับ:

1. **สรุปหน้าจอ** — หน้านี้ใช้ทำอะไร, user ทำอะไรบ้าง (flow)
2. **ปัญหาของ layout เดิม** — จุดที่ใช้งานยาก, สายตาต้องวิ่งไกล, ขั้นตอนเยอะเกินไป
3. **Layout ใหม่ที่เสนอ** — อธิบายการจัดวาง + เหตุผลว่าทำไมถึงดีกว่า
4. **Code** — implement เต็มตาม convention (PART 6) + composable (PART 5)

===================================================
End of Boilerplate
===================================================
