<template>
  <v-card rounded="lg" border>
    <v-row class="bg-primary" no-gutters>
      <div class="text-white pa-4 d-flex align-center text-title-large font-weight-bold">
        ข้อมูลบุคคล
      </div>
    </v-row>

    <v-card-text>
      <v-row>
        <v-col cols="12" md="6">
          <div class="d-flex flex-column mb-4">
            <span class="text-body-medium text-grey">เลขประจำตัวประชาชน</span>
            <span class="text-body-large font-weight-bold">{{ person.personalID }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="d-flex flex-column mb-4">
            <span class="text-body-medium text-grey">เลขชิปบัตร</span>
            <span class="text-body-large font-weight-bold">{{ person.chipID }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="d-flex flex-column mb-4">
            <span class="text-body-medium text-grey">ชื่อ-สกุล</span>
            <span class="text-body-large font-weight-bold">{{ fullNamePrint }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="3">
          <div class="d-flex flex-column mb-4">
            <span class="text-body-medium text-grey">เพศ</span>
            <span class="text-body-large font-weight-bold">{{ sexLabel }}</span>
          </div>
        </v-col>
        <v-col cols="12" md="3">
          <div class="d-flex flex-column mb-4">
            <span class="text-body-medium text-grey">คำนำหน้าชื่อ</span>
            <span class="text-body-large font-weight-bold">{{ person.title.description.thai.fullPrint }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { formatName } from "@cdglib/js-formatify";

import type { WatermarkPersonInfo } from "~/types";

const props = defineProps<{
  person: WatermarkPersonInfo
}>();

const fullNamePrint = computed(() => {
  const currentPerson = props.person;
  return formatName.infToPrint({
    title_sex: currentPerson.title.titleSex,
    title_print: currentPerson.title.description.thai.shortPrint,
    sex: currentPerson.sex,
    fname: currentPerson.firstName,
    mname: currentPerson.middleName,
    lname: currentPerson.lastName,
  }).short;
});

const sexLabel = computed(() => {
  if (props.person.sex === 1) return "ชาย";
  if (props.person.sex === 2) return "หญิง";
  return "-";
});
</script>
