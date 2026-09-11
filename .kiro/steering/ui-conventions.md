---
inclusion: always
---

# UI & Styling Conventions

UI conventions ทั้งหมดถูกกำหนดไว้ใน #[[file:project-patterns.md]] (PART 6: Design System & Components, Step 20-23)

สรุปสั้น:
- Vuetify components เท่านั้น — ห้ามใช้ native HTML elements
- color ใช้ชื่อ Vuetify (primary, error, warning) — ห้ามใส่ hex
- icon ใช้ mdi เท่านั้น
- label/title ภาษาไทย

Form Inputs (v-text-field, v-select, v-autocomplete):
- variant="outlined" density="compact" persistent-placeholder hide-details="auto" rounded="lg"

Buttons (v-btn):
- ทุกปุ่ม: rounded="lg" color="primary" เป็น default
- Action หลัก (บันทึก): variant="flat" color="primary"
- Action รอง (ค้นหา): variant="outlined" color="primary"

Display-Only Field (แสดงข้อมูลใน form ไม่ใช่กรอก):
- ใช้ div > span ไม่ใช่ v-text-field readonly
- label: text-body-medium text-grey
- value: text-body-large font-weight-bold
- อยู่ใน v-row > v-col เหมือน form input

Layout:
- v-container fluid เป็น wrapper
- Page title: <div class="text-headline-small font-weight-semibold mb-4">
- Section subtitle: <div class="text-title-large font-weight-semibold mb-2 text-primary">
- ไม่ต้องครอบ v-card ถ้าหน้ามี form + table แยก section
Alert: variant="tonal" closable
Table: v-sheet(border rounded="lg") > v-table(fixed-header) — ห้ามใช้ v-data-table
- thead: bg-primary + text-white + text-body-large + rounded corners
- td: text-center เสมอ
- ห้ามใช้ inline style — ใช้ Vuetify utility classes
- ห้ามใช้ alert()/confirm() — ใช้ $swal

UX Improvements (ปรับปรุงจากรูปที่ส่งมาให้ใช้งานง่ายขึ้น):
- ปุ่มค้นหาวาง row เดียวกับ input, search ด้วย Enter ได้
- ปุ่ม action หลักอยู่ขวาสุด + prepend-icon
- ก่อน action อันตราย (ลบ/บันทึก) confirm ด้วย $swal
- หลัง action สำเร็จ แสดง $swal success
- Empty state แสดงข้อความ "ไม่พบข้อมูล" ไม่ใช่ตารางว่าง
- Loading state ชัดเจนทั้งปุ่มและ table
