// types/nuxt.d.ts
import type { Swal } from "sweetalert2";

declare module "#app" {
  interface NuxtApp {
    $swal: Swal;
  }
}

declare module "@cdglib/js-formatify";
