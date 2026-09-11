<template>
  <v-app-bar
    flat
    height="50"
  >
    <v-breadcrumbs
      :items="breadcrumbsItem"
      density="compact"
      class=""
    />
    <template #append>
      <span class="text-body-medium font-weight-medium text-black">
        วันที่
        <NuxtTime
          :datetime="now"
          locale="th-TH"
          year="numeric"
          month="long"
          day="numeric"
          hour="2-digit"
          minute="2-digit"
          second="2-digit"
          time-zone="Asia/Bangkok"
        />
        <span> น.</span>
      </span>
    </template>
  </v-app-bar>
</template>

<script setup lang="ts">
import { useNow } from "@vueuse/core";
import type { BreadcrumbItem } from "~/types";

const now = useNow();

defineProps<{
  breadcrumbsItem?: BreadcrumbItem[]
}>();
</script>
