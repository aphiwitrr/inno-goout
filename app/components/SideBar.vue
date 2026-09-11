<script setup lang="ts">
import type { MenuItem } from "~/types";

defineProps<{
  drawer: boolean
  isCollapsed: boolean
  menuItems: MenuItem[]
  appVersion?: string
}>();

const emit = defineEmits<{
  toggleCollapse: []
  navigate: [path: string, external: boolean]
}>();
</script>

<template>
  <v-navigation-drawer
    :model-value="drawer"
    :rail="isCollapsed"
    permanent
  >
    <div class="collapse-button-container">
      <v-btn
        id="collapse-button"
        icon
        size="25"
        color="primary"
        @click="emit('toggleCollapse')"
      >
        <v-icon>
          {{ isCollapsed ? "mdi-chevron-right" : "mdi-chevron-left" }}
        </v-icon>
      </v-btn>
    </div>
    <v-list nav>
      <template
        v-for="(item, index) in menuItems"
        :key="item.path"
      >
        <v-list-item
          id="menu-item"
          :title="item.title"
          :prepend-icon="item.icon"
          :active="item.active"
          rounded
          @click="emit('navigate', item?.path, item?.external ?? false)"
        >
          <template #title>
            <span class="text-body-large mb-0 text-wrap">
              {{ isCollapsed ? "" : item.title }}
            </span>
          </template>
        </v-list-item>
        <v-divider
          v-if="index === 0"
          class="mb-2"
        />
      </template>
    </v-list>

    <template #append>
      <div
        v-if="!isCollapsed"
        class="pa-2"
      >
        <v-icon size="16">
          mdi-tag-outline
        </v-icon>
        v.{{ appVersion }}
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.collapse-button-container {
  position: absolute;
  top: 15px;
  right: -12px;
  z-index: 1000;
}
</style>
