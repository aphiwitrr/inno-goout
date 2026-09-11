---
inclusion: always
---

# Boilerplate Architecture Guide

เมื่อสร้าง feature ใหม่ หรือแก้ไข code ใน project นี้ ให้ปฏิบัติตาม pattern ที่กำหนดใน #[[file:project-patterns.md]] อย่างเคร่งครัด

## Quick Reference

### สร้าง entity ใหม่ — ต้องสร้างไฟล์ตาม pattern นี้เสมอ

1. `app/types/xxx.d.ts` — DTO + Domain Model
2. `app/types/index.d.ts` — เพิ่ม `export * from "./xxx"`
3. `app/repositories/xxx.repository.ts` — extend `useBaseRepository()`
4. `app/composables/useXxx.ts` — **logic ทั้งหมดอยู่ที่นี่** (state, actions, computed, validation)
5. `app/pages/xxx.vue` — **แค่ template binding** ห้ามมี logic

### Core Rule: Logic อยู่ใน Composable เท่านั้น

- **Composable** = state + actions + computed + business logic + $swal confirm
- **Page** = template binding เท่านั้น (destructure composable + static data)
- **ห้าม** มี computed, if/else, async function, $fetch, $swal ใน page

### Data Flow

```
page (template only) → composable (all logic) → repository → $fetch
                              ↓                        ↑
                        data transformation    useErrorHandler().handleError
```
