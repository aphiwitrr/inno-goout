# ระบบบัตรประจำตัวประชาชน — Frontend

Nuxt 4 + Vuetify 3 + TypeScript

## Tech Stack

| เทคโนโลยี | เวอร์ชัน | หน้าที่ |
|-----------|---------|--------|
| Nuxt | 4.3 | Framework (SPA mode) |
| Vue | 3.5 | UI Library |
| Vuetify | 3.11 | Component Library |
| TypeScript | 5.9 | Type Safety |
| Bun | 1.3 | Package Manager / Runtime |
| Vitest | 3.1 | Testing |
| ESLint | 9.x | Linting (stylistic) |
| SweetAlert2 | 11.x | Dialog/Alert |

## Prerequisites

- [Bun](https://bun.sh/) >= 1.3
- [Docker](https://www.docker.com/) + Docker Compose (สำหรับ dev container)
- Access to private NPM registry (ต้องมี `NPM_REPOSITORY` + `NPM_TOKEN_READONLY`)

## Initialize

1. **การขึ้นโปรเจกต์ใหม่**

สร้าง repo ใหม่ ติ๊ก Initialize repository with a README ออก

```bash
git clone {api-repository-url}
cd {api-project-directory}
git remote add template {api-template-repository-url}
git fetch --all
git reset --hard 0.1.0-template
git push origin main
git checkout -b develop
```

2. **ใช้ template เวอร์ชันล่าสุด (หรือ template มีการอัปเดต)**

```bash
git merge --squash {tag from template}
```

## Environment Variables

### `.env.local` — สำหรับ Docker build (NPM registry)

```env
NPM_REPOSITORY=https://nexus.cw.cdg.co.th/repository/npm-public/
NPM_TOKEN_READONLY=NpmToken.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### `.env.development.local` — สำหรับ dev runtime

```env
NUXT_PROXY_TARGET=https://api.example.com
NUXT_APP_PROGRAM_NAME=ชื่อโปรแกรม
```

| ตัวแปร | หน้าที่ | ค่า default |
|--------|--------|-------------|
| `NUXT_PROXY_TARGET` | Backend URL ที่ Vite proxy จะ forward `/api` ไป | `https://bm.bora.dopa.go.th` |
| `NUXT_APP_PROGRAM_NAME` | ชื่อโปรแกรมแสดงบน header | `""` |
| `NUXT_APP_VERSION` | เวอร์ชันแสดงที่ sidebar | `1.0.0` |
| `NUXT_APP_SYSTEM_NAME` | ชื่อระบบ | `""` |

### App Base URL

แก้ที่ `nuxt.config.ts` ตัวแปร `APP_BASE_URL` ที่เดียว:

```ts
const APP_BASE_URL = "/idcard/card-pay/";
```

Proxy จะ sync ตามอัตโนมัติ ไม่ต้องแก้ที่อื่น

## Getting Started

### วิธีที่ 1: Docker (แนะนำ)

```bash
# รัน dev server
docker compose -f compose-dev.yml --env-file .env.local up -d --build web

# รัน test
docker compose -f compose-dev.yml --env-file .env.local up --build test

# หยุด
docker compose -f compose-dev.yml down
```

เข้าใช้งานที่ http://localhost:3000/idcard/card-pay/

### วิธีที่ 2: Local

```bash
# ติดตั้ง dependencies
bun install

# รัน dev server
bun run dev

# build production
bun run build

# preview production build
bun run preview
```

## Scripts

| คำสั่ง | หน้าที่ |
|--------|--------|
| `bun run dev` | รัน dev server (port 3000) |
| `bun run build` | Build production |
| `bun run preview` | Preview production build |
| `bun run test` | รัน tests (watch mode) |
| `bun run coverage` | รัน tests + coverage report |

## Project Structure

```
app/
├── assets/              # Fonts, images, SASS
├── components/          # Shared Vue components
│   ├── AppBar.vue       # Header (responsive, logo, user info)
│   ├── SideBar.vue      # Navigation drawer (collapsible)
│   └── LoadingOverlay.vue
├── composables/         # Business logic composables
│   ├── states.ts        # Global state (useState)
│   ├── useAuthentication.ts
│   ├── useErrorHandler.ts   # Error system กลาง
│   ├── useExample.ts        # ตัวอย่าง domain composable
│   └── useLayoutInfo.ts
├── layouts/             # Nuxt layouts
│   ├── default.vue      # Orchestrator (AppBar + SideBar + main)
│   └── subheader.vue    # Breadcrumbs + datetime
├── mappers/             # DTO → Domain Model mappers
│   ├── base.mapper.ts   # mapArray, mapNullable
│   └── example.mapper.ts
├── pages/               # Route pages
├── plugins/             # Nuxt plugins (Vuetify, SweetAlert2)
├── repositories/        # API layer ($fetch wrappers)
│   ├── auth.repository.ts
│   ├── base.repository.ts   # Base HTTP helpers
│   └── example.repository.ts
└── types/               # TypeScript type definitions
    ├── api.d.ts         # ApiResponse, AppError, RequestOptions, QueryParams
    ├── example.d.ts     # ExampleDTO, Example (ตัวอย่าง)
    ├── index.d.ts       # Barrel export
    ├── layout.d.ts      # BreadcrumbItem, MenuItem
    ├── login-info.d.ts  # LoginInfoType, BoraEmployee
    └── nuxt.d.ts        # Type augmentation ($swal)

tests/                   # Vitest test files (mirror app/ structure)
├── components/
├── composables/
├── layouts/
├── mappers/
├── pages/
├── plugins/
└── repositories/
```

## Architecture

```
Page → Composable → Repository → $fetch → Vite Proxy → Backend
           ↓              ↑
     mapArray(data, mapper)   useErrorHandler().handleError
```

### Component Structure

```
default.vue (orchestrator)
├── AppBar.vue        ← props: programName, userName, workplace
├── SideBar.vue       ← props: drawer, isCollapsed, menuItems, appVersion
│                        events: @toggle-collapse, @navigate
└── v-main
    ├── subheader.vue ← props: breadcrumbsItem
    └── slot (page)
```

### Proxy Flow (Dev)

```
$fetch("/api/sso/login/v1/info")
→ browser: /idcard/card-pay/api/sso/login/v1/info
→ Vite proxy: rewrite ลบ base path → /api/sso/login/v1/info
→ forward ไป NUXT_PROXY_TARGET/api/sso/login/v1/info
```

Production ไม่ใช้ Vite proxy — nginx/reverse proxy route `/api` ไปหา backend โดยตรง

### Auth Flow

```
default.vue (onMounted) → useAuthentication().getLoginInfo()
→ useAuthRepository().getLoginInfo() → $fetch("/api/sso/login/v1/info")
→ ถ้า 401 → useErrorHandler → swal "Token หมดอายุ" → redirect /login
→ ถ้าสำเร็จ → set loginInfo state → แสดง UI
```

ไม่ใช้ auth middleware — ให้ backend ตัดสินว่า token valid หรือไม่

## สร้าง Feature ใหม่

เมื่อสร้าง entity ใหม่ ต้องสร้างไฟล์ตาม pattern นี้:

1. `app/types/xxx.d.ts` — DTO (snake_case) + Domain Model (camelCase)
2. `app/types/index.d.ts` — เพิ่ม `export * from "./xxx"`
3. `app/repositories/xxx.repository.ts` — extend `useBaseRepository()`
4. `app/mappers/xxx.mapper.ts` — DTO → Domain Model
5. `app/composables/useXxx.ts` — expose: data, loading, error, fetch
6. `app/pages/xxx.vue` — UI (Vuetify)
7. `tests/` — สร้าง test ให้ครบทุก layer

ดูตัวอย่างจริงได้ที่ `example.*` files (types, repository, mapper, composable)

รายละเอียดทั้งหมดอยู่ใน [`project-patterns.md`](./project-patterns.md)

## Testing

```bash
# รัน tests ทั้งหมด (single run)
bunx vitest run

# รัน tests (watch mode)
bun run test

# รัน coverage
bun run coverage
```

Test structure mirror ตาม `app/`:

```
tests/
├── components/    loadingOverlay.test.ts
├── composables/   useErrorHandler, useAuthentication, useExample, useLayoutInfo, states
├── layouts/       default, subheader
├── mappers/       base.mapper, example.mapper
├── pages/         app, index
├── plugins/       vuetify, sweetalert2
└── repositories/  auth, base, example
```

## UI Conventions

- **Font**: Bai Jamjuree (Thai)
- **Colors**: ใช้ Vuetify color name (`primary`, `error`, `warning`) ห้ามใส่ hex
- **Icons**: Material Design Icons (mdi) เท่านั้น
- **Locale**: ภาษาไทยทั้งหมด
- **Form inputs**: `variant="outlined" density="compact" rounded="lg" persistent-placeholder hide-details="auto"`
- **Buttons**: `rounded="lg" color="primary"` — action หลัก `variant="flat"` / action รอง `variant="outlined"`
- **Table**: `v-sheet(border rounded="lg")` > `v-table(fixed-header)` + `bg-primary` header
- **Page title**: `<div class="text-headline-small font-weight-semibold mb-4">`
- **Section subtitle**: `<div class="text-title-large font-weight-semibold mb-2 text-primary">`
- **Dialog/Alert**: ใช้ `$swal` เท่านั้น ห้ามใช้ `alert()` / `confirm()`

รายละเอียดทั้งหมดอยู่ใน [`project-patterns.md`](./project-patterns.md) (PART 6)

## Docker

| Service | Dockerfile | หน้าที่ |
|---------|-----------|--------|
| `web` | `Dockerfile.dev` | Dev server + hot reload |
| `test` | `Dockerfile.test` | รัน tests + coverage |

```bash
# Dev
docker compose -f compose-dev.yml --env-file .env.local up -d --build web

# Test
docker compose -f compose-dev.yml --env-file .env.local up --build test

# หยุด
docker compose -f compose-dev.yml down
```
