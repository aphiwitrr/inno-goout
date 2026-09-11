<template>
  <div class="watermark-summary-container">
    <!-- Header Section -->
    <div class="mb-6">
      <div class="text-headline-small font-weight-bold text-primary d-flex align-center">
        <v-icon
          class="mr-2"
          color="primary"
        >
          mdi-shield-crown-outline
        </v-icon>
        สรุปเทคนิคการป้องกันและแสดงลายน้ำ (Watermark & Data Protection)
      </div>
      <div class="text-body-medium text-grey-darken-1 mt-1">
        ภาพรวมเทคนิคการรักษาความปลอดภัย การใส่ลายน้ำระบุตัวตน และการป้องกันการรั่วไหลของข้อมูลภาพบัตรประจำตัวประชาชน
      </div>
    </div>

    <!-- Active User & Audit Info Banner -->
    <v-card
      rounded="lg"
      border
      class="mb-6 bg-blue-grey-lighten-5"
    >
      <v-card-text class="py-3">
        <v-row
          align="center"
          no-gutters
        >
          <v-col
            cols="12"
            md="4"
            class="d-flex align-center py-1"
          >
            <v-icon
              color="primary"
              class="mr-2"
            >
              mdi-office-building-outline
            </v-icon>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">
                หน่วยงาน / สำนักทะเบียน
              </div>
              <div class="text-body-medium font-weight-bold text-grey-darken-3">
                {{ workplaceName }}
              </div>
            </div>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex align-center py-1"
          >
            <v-icon
              color="primary"
              class="mr-2"
            >
              mdi-ip-network-outline
            </v-icon>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">
                ผู้ใช้งาน / IP ประจำเครื่อง
              </div>
              <div class="text-body-medium font-weight-bold text-grey-darken-3">
                {{ ipAddress }}
              </div>
            </div>
          </v-col>
          <v-col
            cols="12"
            md="4"
            class="d-flex align-center py-1"
          >
            <v-icon
              color="primary"
              class="mr-2"
            >
              mdi-clock-check-outline
            </v-icon>
            <div>
              <div class="text-caption text-grey-darken-1 font-weight-medium">
                เวลาที่เข้าสู่ระบบ
              </div>
              <div class="text-body-medium font-weight-bold text-grey-darken-3">
                {{ currentDateTime }}
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Technique Cards Grid -->
    <div class="text-title-large font-weight-bold mb-4 d-flex align-center">
      <v-icon
        class="mr-2"
        color="secondary"
      >
        mdi-view-grid-plus-outline
      </v-icon>
      รูปแบบและเทคนิคที่มีในระบบ
    </div>

    <v-row class="mb-6">
      <!-- Method 1 Card -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          rounded="lg"
          border
          class="h-100 d-flex flex-column hover-card"
        >
          <v-card-item class="bg-primary text-white">
            <template #prepend>
              <v-icon size="28">
                mdi-numeric-1-box-multiple
              </v-icon>
            </template>
            <v-card-title class="font-weight-bold">
              วิธีที่ 1 : ตารางหมากรุก 4x4
            </v-card-title>
            <v-card-subtitle class="text-blue-lighten-4">
              Chessboard SVG Pattern 4x4 Overlay
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-4 flex-grow-1">
            <p class="text-body-medium mb-3">
              แสดงข้อความระบุสำนักทะเบียนและรหัสผู้ใช้งานลอยทับทั้งหน้าจอ โดยกระจายแบบตารางสุ่มตำแหน่งและสุ่มมุมเอียง (-35° ถึง -5°)
            </p>
            <div class="bg-grey-lighten-4 pa-3 rounded-lg mb-3">
              <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
                จุดเด่นเทคนิค:
              </div>
              <ul class="text-caption text-grey-darken-2 pl-4">
                <li>ใช้พื้นหลังตัวอักษรแบบ SVG ตารางหมากรุก 4x4 px (-webkit-background-clip: text)</li>
                <li>ทำให้เมื่อถ่ายรูปหรือแคปหน้าจอ ตัวอักษรจะมีรอยไข่ปลา ลบออกยาก</li>
                <li>ไม่บดบังการอ่านข้อมูลสำคัญบนหน้าจอ แต่ยังสามารถตามรอยได้</li>
              </ul>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-eye-outline"
              block
              to="/watermark/preview-1"
            >
              ทดลองดูตัวอย่างวิธีที่ 1
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Method 2 Card -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          rounded="lg"
          border
          class="h-100 d-flex flex-column hover-card"
        >
          <v-card-item class="bg-primary text-white">
            <template #prepend>
              <v-icon size="28">
                mdi-numeric-2-box-multiple
              </v-icon>
            </template>
            <v-card-title class="font-weight-bold">
              วิธีที่ 2 : ตารางหมากรุก 6x6
            </v-card-title>
            <v-card-subtitle class="text-blue-lighten-4">
              Chessboard SVG Pattern 6x6 Overlay
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-4 flex-grow-1">
            <p class="text-body-medium mb-3">
              แสดงข้อความลายน้ำสุ่มตำแหน่งคล้ายวิธีที่ 1 แต่ปรับขนาดตารางหมากรุก SVG เป็นขนาด 6x6 พิกเซล
            </p>
            <div class="bg-grey-lighten-4 pa-3 rounded-lg mb-3">
              <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
                จุดเด่นเทคนิค:
              </div>
              <ul class="text-caption text-grey-darken-2 pl-4">
                <li>ช่องตารางหมากรุกมีขนาด 3x3 ในขนาด 6x6 px ทำให้มีความชัดเจนของข้อความเพิ่มขึ้น</li>
                <li>ปรับขนาด Font เป็น 28px เพื่อความกระชับและครอบคลุมพื้นที่การแสดงผล</li>
                <li>ทนทานต่อการถูกครอบตัด (Crop) หรือการนำภาพไปบีบอัดไฟล์</li>
              </ul>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-eye-outline"
              block
              to="/watermark/preview-2"
            >
              ทดลองดูตัวอย่างวิธีที่ 2
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Method 3 Card -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          rounded="lg"
          border
          class="h-100 d-flex flex-column hover-card"
        >
          <v-card-item class="bg-primary text-white">
            <template #prepend>
              <v-icon size="28">
                mdi-numeric-3-box-multiple
              </v-icon>
            </template>
            <v-card-title class="font-weight-bold">
              วิธีที่ 3 : ข้อความโปร่งใสแบบวุ้น
            </v-card-title>
            <v-card-subtitle class="text-blue-lighten-4">
              Jelly &amp; Glassmorphic Text Watermark
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-4 flex-grow-1">
            <p class="text-body-medium mb-3">
              แสดงข้อความลายน้ำสุ่มตำแหน่งด้วยเอฟเฟกต์ตัวอักษรโปร่งใส 100% ลายเส้นขอบและแสงเงาแบบกระจก/วุ้นใส (Jelly Effect)
            </p>
            <div class="bg-grey-lighten-4 pa-3 rounded-lg mb-3">
              <div class="text-caption font-weight-bold text-grey-darken-2 mb-1">
                จุดเด่นเทคนิค:
              </div>
              <ul class="text-caption text-grey-darken-2 pl-4">
                <li>เนื้อตัวอักษรโปร่งใส มองทะลุเห็นข้อมูลด้านหลังได้ชัดเจน</li>
                <li>ใช้เทคนิค Text Stroke + แสงเงา 3D นูนใสเหมือนหยดน้ำ/วุ้น</li>
                <li>ไม่บดบังสายตา ให้ความรู้สึกพรีเมียมและสวยงาม</li>
              </ul>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-btn
              color="primary"
              variant="flat"
              prepend-icon="mdi-eye-outline"
              block
              to="/watermark/preview-3"
            >
              ทดลองดูตัวอย่างวิธีที่ 3
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Client-side Security Features -->
    <v-card
      rounded="lg"
      border
      class="mb-6"
    >
      <v-card-item class="bg-grey-lighten-4">
        <v-card-title class="text-title-large font-weight-bold text-grey-darken-3 d-flex align-center">
          <v-icon
            color="success"
            class="mr-2"
          >
            mdi-shield-lock-outline
          </v-icon>
          มาตรการป้องกันความปลอดภัยระดับ Client-side (Active All Pages)
        </v-card-title>
      </v-card-item>

      <v-card-text class="pa-4">
        <v-row>
          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              variant="outlined"
              rounded="lg"
              class="h-100 pa-2 border-dashed"
            >
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    color="primary"
                    class="mr-2"
                  >
                    mdi-image-off-outline
                  </v-icon>
                  <span class="font-weight-bold text-body-medium">HTML5 Canvas Only</span>
                </div>
                <div class="text-caption text-grey-darken-1">
                  วาดรูปภาพลงบน Canvas แทนการใช้แท็ก &lt;img&gt; ป้องกันคำสั่ง Save Image As และการ Drag & Drop
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              variant="outlined"
              rounded="lg"
              class="h-100 pa-2 border-dashed"
            >
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    color="primary"
                    class="mr-2"
                  >
                    mdi-cursor-default-click-outline
                  </v-icon>
                  <span class="font-weight-bold text-body-medium">Context Menu Block</span>
                </div>
                <div class="text-caption text-grey-darken-1">
                  ปิดกั้นการคลิกขวา (@contextmenu.prevent) และคำสั่ง Copy (user-select: none) ทั่วทั้งคอมโพเนนต์
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              variant="outlined"
              rounded="lg"
              class="h-100 pa-2 border-dashed"
            >
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    color="primary"
                    class="mr-2"
                  >
                    mdi-eye-check-outline
                  </v-icon>
                  <span class="font-weight-bold text-body-medium">MutationObserver</span>
                </div>
                <div class="text-caption text-grey-darken-1">
                  ตรวจจับการเปิด DevTools แก้ไข Style หรือลบ Element หากพบจะล้าง Canvas และล็อกหน้าจอทันที
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              variant="outlined"
              rounded="lg"
              class="h-100 pa-2 border-dashed"
            >
              <v-card-text>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    color="primary"
                    class="mr-2"
                  >
                    mdi-printer-off
                  </v-icon>
                  <span class="font-weight-bold text-body-medium">Print CSS Protection</span>
                </div>
                <div class="text-caption text-grey-darken-1">
                  บล็อกการสั่งพิมพ์หน้าจอ (Ctrl+P) หรือบันทึก PDF โดยซ่อนภาพและแสดงหน้าจอเตือนความปลอดภัย
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Comparison Table -->
    <v-card
      rounded="lg"
      border
      class="mb-4"
    >
      <v-card-item class="bg-grey-lighten-4">
        <v-card-title class="text-title-large font-weight-bold text-grey-darken-3 d-flex align-center">
          <v-icon
            color="info"
            class="mr-2"
          >
            mdi-table-headers-eye
          </v-icon>
          ตารางเปรียบเทียบคุณสมบัติของแต่ละวิธี
        </v-card-title>
      </v-card-item>

      <v-table
        density="comfortable"
        class="text-body-medium"
      >
        <thead>
          <tr class="bg-grey-lighten-5">
            <th class="font-weight-bold text-left">
              คุณสมบัติ / การป้องกัน
            </th>
            <th class="font-weight-bold text-center">
              วิธีที่ 1 (SVG 4x4)
            </th>
            <th class="font-weight-bold text-center">
              วิธีที่ 2 (SVG 6x6)
            </th>
            <th class="font-weight-bold text-center">
              วิธีที่ 3 (สีโปร่งใส)
            </th>
            <th class="font-weight-bold text-center">
              การ์ดแสดงผล (Client Defense)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-weight-medium">
              ขอบเขตการแสดงผล (Scope)
            </td>
            <td class="text-center">
              ทั้งหน้าเว็บ (Page Overlay)
            </td>
            <td class="text-center">
              ทั้งหน้าเว็บ (Page Overlay)
            </td>
            <td class="text-center">
              ทั้งหน้าเว็บ (Page Overlay)
            </td>
            <td class="text-center">
              เฉพาะภาพตัวอย่าง (Card Canvas)
            </td>
          </tr>
          <tr>
            <td class="font-weight-medium">
              การป้องกันการถ่ายภาพ / แคปหน้าจอ
            </td>
            <td class="text-center text-success font-weight-bold">
              <v-icon
                color="success"
                size="small"
              >
                mdi-check-circle
              </v-icon> ระดับสูง
            </td>
            <td class="text-center text-success font-weight-bold">
              <v-icon
                color="success"
                size="small"
              >
                mdi-check-circle
              </v-icon> ระดับสูงมาก
            </td>
            <td class="text-center text-success font-weight-bold">
              <v-icon
                color="success"
                size="small"
              >
                mdi-check-circle
              </v-icon> ระดับมาตรฐาน
            </td>
            <td class="text-center text-grey">
              ตามการใช้งานร่วม
            </td>
          </tr>
          <tr>
            <td class="font-weight-medium">
              การป้องกันการคลิกขวา Save As / Drag
            </td>
            <td class="text-center text-success">
              รองรับ
            </td>
            <td class="text-center text-success">
              รองรับ
            </td>
            <td class="text-center text-success">
              รองรับ
            </td>
            <td class="text-center text-success font-weight-bold">
              <v-icon
                color="success"
                size="small"
              >
                mdi-check-circle
              </v-icon> ป้องกัน 100%
            </td>
          </tr>
          <tr>
            <td class="font-weight-medium">
              การป้องกันการลบ Element ผ่าน DevTools
            </td>
            <td class="text-center text-warning">
              ระดับปานกลาง
            </td>
            <td class="text-center text-warning">
              ระดับปานกลาง
            </td>
            <td class="text-center text-warning">
              ระดับปานกลาง
            </td>
            <td class="text-center text-success font-weight-bold">
              <v-icon
                color="success"
                size="small"
              >
                mdi-check-circle
              </v-icon> ล้าง Canvas ทันที
            </td>
          </tr>
          <tr>
            <td class="font-weight-medium">
              การป้องกันการพิมพ์ (Print / Save PDF)
            </td>
            <td class="text-center text-success">
              รองรับ
            </td>
            <td class="text-center text-success">
              รองรับ
            </td>
            <td class="text-center text-success">
              รองรับ
            </td>
            <td class="text-center text-success font-weight-bold">
              <v-icon
                color="success"
                size="small"
              >
                mdi-check-circle
              </v-icon> ซ่อนรูปภาพ 100%
            </td>
          </tr>
          <tr>
            <td class="font-weight-medium">
              ความง่ายในการอ่านข้อมูลของผู้ใช้งาน
            </td>
            <td class="text-center text-success">
              อ่านง่าย / รบกวนสายตาน้อย
            </td>
            <td class="text-center text-info">
              อ่านได้ชัดเจน
            </td>
            <td class="text-center text-success font-weight-bold">
              อ่านสบายตาที่สุด
            </td>
            <td class="text-center text-success">
              ไม่มีผลกระทบต่อสายตา
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { workplace, getUserName } = useAuthentication();

// ข้อความสำนักทะเบียน และ IP
const workplaceName = computed(() => workplace.value || "สำนักทะเบียนกลาง (1001)");
const ipAddress = computed(() => getUserName.value || "123123123123");
const currentDateTime = computed(() => new Date().toLocaleString("th-TH"));
</script>

<style scoped>
.watermark-summary-container {
  min-height: 80vh;
}

.hover-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

.border-dashed {
  border-style: dashed !important;
}
</style>
