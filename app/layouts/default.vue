<script setup lang="ts">
const { getLoginInfo, getUserName, workplace } = useAuthentication();

onMounted(async () => {
  await getLoginInfo();
});

const config = useRuntimeConfig();

const {
  getBreadcrumbs,
  menuItems,
  drawer,
  isCollapsed,
  toggleCollapse,
  navigateToRoute,
} = useLayoutInfo();
</script>

<template>
  <AppBar
    :program-name="config?.public?.programName"
    :user-name="getUserName"
    :workplace="workplace"
  />

  <SideBar
    :drawer="drawer"
    :is-collapsed="isCollapsed"
    :menu-items="menuItems"
    :app-version="config.public?.appVersion"
    @toggle-collapse="toggleCollapse"
    @navigate="navigateToRoute"
  />

  <v-main>
    <SubHeader :breadcrumbs-item="getBreadcrumbs" />

    <v-container
      fluid
      class="pt-0"
    >
      <slot />
    </v-container>
  </v-main>
</template>
