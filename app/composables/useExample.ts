/**
 * ── Example Composable ──────────────────────────────
 * ตัวอย่างการสร้าง domain composable ตาม boilerplate pattern
 *
 * Data Flow:
 *   page → useExample() → useExampleRepository() → useBaseRepository() → $fetch
 *                ↓                                         ↑
 *        mapArray(data, mapExample)              useErrorHandler().handleError (default, แสดง $swal)
 *
 * หมายเหตุ: repository แสดง $swal error ให้อัตโนมัติเป็น default
 * ถ้า action ไหนต้องการ custom confirm/success/error dialog เอง (เช่น createExample)
 * ให้เรียก repo ด้วย silent: true แล้วจัดการ $swal เองใน composable
 */

import { createPdfToDataUrl, printDoc } from "@cdglib/js-pdfmake";

import type { Example, CreateExample, AppError, QueryParams, DefinitionsOptionsType } from "~/types";
import { mapArray } from "~/mappers/base.mapper";
import { mapExample, mapCreateExampleDTO } from "~/mappers/example.mapper";
import generateLayout from "~/printouts/example";

export const useExample = () => {
  // ── Dependencies ──────────────────────────
  const repo = useExampleRepository();
  const { getUserName } = useAuthentication();
  const { silentError } = useErrorHandler();
  const loginInfo = useLoginInfo();
  const { $swal } = useNuxtApp();

  // ── State ─────────────────────────────────
  const examples = ref<Example[]>([]);
  const loading = ref(false);
  const error = ref<AppError | null>(null);

  // ── Actions ───────────────────────────────
  const fetchExamples = async (params?: QueryParams) => {
    try {
      loading.value = true;
      error.value = null;

      const res = await repo.getExamples(params);

      if (res.data) {
        examples.value = mapArray(res.data, mapExample);
      }
    }
    catch (e) {
      error.value = silentError(e);
    }
    finally {
      loading.value = false;
    }
  };

  const createExample = async (payload: CreateExample) => {
    const confirmed = await $swal?.fire({
      title: "ยืนยันการบันทึก",
      text: "คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirmed?.isConfirmed) return;

    try {
      loading.value = true;
      error.value = null;

      // silent: true — จัดการ error dialog เองด้านล่าง ไม่ให้ repository แสดง dialog ซ้ำ
      const res = await repo.createExample(mapCreateExampleDTO(payload), true);

      if (res.data) {
        await $swal?.fire({
          title: "บันทึกสำเร็จ",
          icon: "success",
        });
        await fetchExamples();
      }
    }
    catch (e) {
      error.value = silentError(e);
      await $swal?.fire({
        title: "ไม่สามารถบันทึกข้อมูลได้",
        text: error.value.message,
        icon: "error",
      });
    }
    finally {
      loading.value = false;
    }
  };

  const onPrint = async () => {
    const thaiDate = new Date().toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const docData: DefinitionsOptionsType = {
      currentDate: thaiDate,
      employeeSender: "",
      rcodeSender: "",
      workPlace: loginInfo.value?.boraEmployee?.workplace?.description ?? "",
      boraEmployeeName: getUserName.value,
      itemsBox: [],
      totalCard: "0",
    };

    const pdfDoc = await createPdfToDataUrl(generateLayout(docData), {
      pageMargins: [10, 90, 30, 70],
      defaultStyle: { fontSize: 16 },
    });

    printDoc(pdfDoc);
  };

  // ── Return ────────────────────────────────
  return {
    examples,
    loading,
    error,
    fetchExamples,
    createExample,
    onPrint,
  };
};
