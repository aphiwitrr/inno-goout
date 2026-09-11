<script setup>
const config = useRuntimeConfig();
useHead({
  meta: [
    { name: "viewport", content: "width=device-width, initial-scale=1" },
  ],
  link: [
    { rel: "icon", href: "/images/sing.ico" },
  ],
  htmlAttrs: {
    lang: "th",
  },
});

const title = config.public?.programName;

useSeoMeta({
  title,
  ogTitle: title,
});
</script>

<template>
  <v-app>
    <NuxtLoadingIndicator />
    <LoadingOverlay />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>
