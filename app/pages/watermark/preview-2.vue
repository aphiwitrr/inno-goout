<template>
  <div class="position-relative watermark-page-container">
    <!-- ลายน้ำหน้าเว็บ แบบสุ่มตำแหน่ง -->
    <div
      class="watermark-overlay"
      aria-hidden="true"
    >
      <div
        v-for="(item, index) in randomWatermarks"
        :key="index"
        class="watermark-item"
        :style="{
          top: item.top,
          left: item.left,
          transform: `rotate(${item.rotate})`,
          opacity: item.opacity,
        }"
      >
        <div>{{ workplaceName }}</div>
        <div>{{ ipAddress }}</div>
      </div>
    </div>

    <div
      class="text-headline-small font-weight-semibold mb-4 position-relative"
      style="z-index: 1;"
    >
      ตัวอย่างลายน้ำ - วิธีที่ 2 ลายน้ำตารางหมากรุก 6x6 (สุ่มตำแหน่ง)
    </div>

    <v-row
      class="position-relative"
      style="z-index: 1;"
    >
      <v-col
        cols="12"
        md="6"
      >
        <WatermarkPersonInfoCard :person="person" />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <WatermarkImagePreviewCard :image-base64="imageBase64">
          <template #protection-overlay />
        </WatermarkImagePreviewCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import WatermarkImagePreviewCard from "~/components/watermark/WatermarkImagePreviewCard.vue";
import WatermarkPersonInfoCard from "~/components/watermark/WatermarkPersonInfoCard.vue";

const { person, imageBase64 } = useWatermarkMock();
const { workplace, getUserName } = useAuthentication();

// ข้อความสำนักทะเบียน และ IP
const workplaceName = computed(() => workplace.value || "สำนักทะเบียนกลาง (1001)");
const ipAddress = ref(getUserName.value || "123123123123");

interface WatermarkPos {
  top: string
  left: string
  rotate: string
  opacity: number
}

const randomWatermarks = ref<WatermarkPos[]>([]);

const generateRandomWatermarks = () => {
  const items: WatermarkPos[] = [];
  const rows = 3;
  const cols = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const baseTop = (r / rows) * 85 + 5;
      const baseLeft = (c / cols) * 80 + 5;
      const randomTopOffset = (Math.random() - 0.5) * 12;
      const randomLeftOffset = (Math.random() - 0.5) * 10;
      const rotate = -20 + (Math.random() - 0.5) * 30;
      const opacity = 0.15 + Math.random() * 0.08;

      items.push({
        top: `${Math.max(2, Math.min(88, baseTop + randomTopOffset))}%`,
        left: `${Math.max(2, Math.min(85, baseLeft + randomLeftOffset))}%`,
        rotate: `${rotate.toFixed(1)}deg`,
        opacity: Number(opacity.toFixed(2)),
      });
    }
  }
  randomWatermarks.value = items;
};

onMounted(() => {
  generateRandomWatermarks();
});
</script>

<style scoped>
.watermark-page-container {
  position: relative;
  min-height: 80vh;
  overflow: hidden;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  user-select: none;
  z-index: 2;
  overflow: hidden;
}

.watermark-item {
  position: absolute;
  text-align: center;
  line-height: 1.5;
  white-space: nowrap;
}

.watermark-item > div {
  font-size: 28px;
  font-weight: 900;
  display: block;

  /* ลายตารางหมากรุกแบบ SVG data-uri 6x6 */
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Crect width='3' height='3' fill='%23555'/%3E%3Crect x='3' y='3' width='3' height='3' fill='%23555'/%3E%3C/svg%3E") repeat;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
</style>
