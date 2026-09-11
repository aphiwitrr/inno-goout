<template>
  <v-card
    rounded="lg"
    border
    class="position-relative no-print-watermark"
  >
    <v-row
      class="bg-primary"
      no-gutters
    >
      <div class="text-white pa-4 d-flex align-center text-title-large font-weight-bold">
        {{ title }}
      </div>
    </v-row>

    <v-card-text>
      <!-- Error state shown when element/CSS tampering is detected by MutationObserver -->
      <div
        v-if="isViolated"
        class="d-flex flex-column justify-center align-center border rounded-lg pa-6 w-100 bg-red-lighten-5 text-red-darken-4 text-center"
        style="min-height: 250px;"
      >
        <v-icon
          size="48"
          color="error"
          class="mb-2"
        >
          mdi-shield-alert-outline
        </v-icon>
        <div class="text-title-medium font-weight-bold">
          ตรวจพบการละเมิดความปลอดภัย (Security Violation)
        </div>
        <div class="text-body-medium mt-2">
          ระบบตรวจพบการพยายามลบ ดัดแปลง หรือปิดบังองค์ประกอบบนหน้าจอ
          <br>ภาพตัวอย่างนี้ถูกทำลายและล็อกการเข้าถึงชั่วคราวเพื่อความปลอดภัย
        </div>
      </div>

      <div
        v-else
        ref="containerRef"
        class="position-relative d-flex justify-center align-center border rounded-lg pa-2 w-100 no-copy-container"
        @contextmenu.prevent
      >
        <canvas
          ref="canvasRef"
          class="preview-canvas"
          @contextmenu.prevent
          @dragstart.prevent
        />

        <!-- Extension seam for protection technique overlays -->
        <slot name="protection-overlay" />
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = withDefaults(
  defineProps<{
    imageBase64: string
    title?: string
  }>(),
  {
    title: "ภาพตัวอย่างบัตรประจำตัวประชาชน",
  },
);

const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const isViolated = ref(false);
let observer: MutationObserver | null = null;

const drawImage = () => {
  const canvas = canvasRef.value;
  if (!canvas || !props.imageBase64 || isViolated.value) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
  };
  img.src = props.imageBase64;
};

// 3. MutationObserver to prevent DOM/CSS tampering
const startObserving = () => {
  if (typeof window === "undefined" || !window.MutationObserver) return;

  const target = containerRef.value;
  if (!target) return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // Detect style or class alterations
      if (mutation.type === "attributes") {
        const elem = mutation.target as HTMLElement;
        const style = window.getComputedStyle(elem);

        if (
          style.display === "none"
          || style.visibility === "hidden"
          || style.opacity === "0"
          || elem.style.opacity === "0"
          || elem.style.display === "none"
          || elem.style.visibility === "hidden"
        ) {
          triggerSecurityViolation();
          break;
        }
      }

      // Detect element removal
      if (mutation.type === "childList") {
        const hasCanvas = target.querySelector(".preview-canvas");
        if (!hasCanvas) {
          triggerSecurityViolation();
          break;
        }
      }
    }
  });

  observer.observe(target, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["style", "class"],
  });
};

const triggerSecurityViolation = () => {
  isViolated.value = true;
  if (observer) {
    observer.disconnect();
  }
  // Clear canvas pixels immediately
  const canvas = canvasRef.value;
  if (canvas) {
    const drawCtx = canvas.getContext("2d");
    if (drawCtx) {
      drawCtx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // Delete canvas width and height to shrink it
    canvas.width = 0;
    canvas.height = 0;
  }
};

onMounted(() => {
  drawImage();
  // Brief delay to ensure Vuetify styles are settled before observing starts
  setTimeout(startObserving, 300);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

watch(
  () => props.imageBase64,
  () => {
    drawImage();
  },
);
</script>

<style scoped>
.no-copy-container {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-select: none;
  user-select: none;
}

.preview-canvas {
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  pointer-events: auto;
}

/* 4. Print Protection Rule */
@media print {
  .no-print-watermark {
    display: none !important;
  }
}
</style>
