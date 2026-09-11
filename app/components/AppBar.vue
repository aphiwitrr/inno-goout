<script setup lang="ts">
import { useDisplay } from "vuetify";

import logoImage from "~/assets/images/logo.png";

const { smAndDown } = useDisplay();

defineProps({
  programName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: "",
  },
  workplace: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <v-app-bar
    app
    height="80"
    elevation="0"
    color="primary"
    class="app-bar-main"
    fixed
    elevate-on-scroll
  >
    <v-container
      fluid
      class="pa-0"
    >
      <v-row
        no-gutters
        class="align-center header-content"
      >
        <!-- ซ้าย: โลโก้ -->
        <v-col
          v-if="!smAndDown"
          cols="12"
          md="4"
          class="d-flex align-center justify-start flex-wrap"
        >
          <v-avatar
            size="50"
            class="logo-avatar mr-4 ms-4"
          >
            <v-img
              :src="logoImage"
              alt="Logo"
              class="w-full h-full object-contain"
            />
          </v-avatar>

          <div class="text-white">
            <div>
              สำนักบริหารการทะเบียน
            </div>
            <div>
              กรมการปกครอง
            </div>
            <div class="text-label-small">
              The Bureau of Registration Administration (BORA)
            </div>
          </div>
        </v-col>

        <!-- กลาง: system title -->
        <v-col
          cols="12"
          md
          class="d-flex align-center justify-center text-title-large font-weight-bold text-center"
        >
          {{ programName }}
        </v-col>

        <!-- ขวา: user info -->
        <v-col
          v-if="!smAndDown"
          cols="12"
          md="4"
          class="d-flex flex-column justify-end px-4"
        >
          <span class="text-title-large text-end ">
            <v-icon
              color="white"
              size="20"
            >
              mdi-map-marker
            </v-icon>
            {{ workplace }}
          </span>
          <div>
            <div class="d-flex justify-end align-center ga-1">
              <v-icon
                size="18"
                color="white"
              >
                mdi-account
              </v-icon>
              <span class="text-white">ผู้ปฏิบัติงาน :</span>
              <span class="text-white">{{ userName }}</span>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<style scoped>
.app-bar-main::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("~/assets/images/vector.svg");
  background-position: right center;
}

.app-bar-main::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("~/assets/images/vector-1.svg");
  background-position: calc(160px) center;
}
</style>
