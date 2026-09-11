import { formatName } from "@cdglib/js-formatify";

import type { AppError } from "~/types";

export const useAuthentication = () => {
  const indicator = useLoadingIndicator();
  const { $swal } = useNuxtApp();

  const loginInfo = useLoginInfo();
  const error = ref<AppError | null>(null);
  const repo = useAuthRepository();

  const getLoginInfo = async () => {
    try {
      indicator.start();
      error.value = null;

      const data = await repo.getLoginInfo();

      if (data) {
        if (!data.boraEmployee) {
          await $swal?.fire({
            title: "ยังไม่ได้เลือกสถานที่ทำงาน",
            text: "กรุณาเลือกสถานที่ทำงานก่อนใช้งานระบบ",
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: false,
          });
          await navigateTo("/");
        }
        loginInfo.value = data;
      }
    }
    catch (e) {
      error.value = e as AppError;
    }
    finally {
      indicator.finish();
    }
  };

  const getUserName = computed(() => {
    if (!loginInfo.value) return "";
    const user = loginInfo.value.user;
    return formatName.infToPrint({
      title_sex: user?.title?.titleSex || "",
      title_print: user?.title?.description?.thai?.shortPrint || "",
      sex: user?.sex || 0,
      fname: user?.firstName || "",
      mname: user?.middleName || "",
      lname: user?.lastName || "",
    }).short;
  });

  const workplace = computed(() => {
    if (!loginInfo.value?.boraEmployee?.workplace) return "";
    const boraEmployee = loginInfo.value.boraEmployee;
    return `[${boraEmployee?.workplace?.code}] - ${boraEmployee?.workplace?.description}`;
  });

  return {
    getLoginInfo,
    getUserName,
    workplace,
    error,
  };
};
