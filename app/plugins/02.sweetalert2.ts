import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default defineNuxtPlugin((nuxtApp) => {
  const swalWithDefaults = Swal.mixin({
    confirmButtonText: "ตกลง",
    cancelButtonText: "ปิด",
    buttonsStyling: false,
    customClass: {
      confirmButton: "v-btn v-btn--flat bg-primary text-white rounded-lg px-4 py-2",
      cancelButton: "v-btn v-btn--flat bg-error text-white rounded-lg px-4 py-2",
      actions: "d-flex ga-2",
    },
  });

  nuxtApp.provide("swal", swalWithDefaults);
});
