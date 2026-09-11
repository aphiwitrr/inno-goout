import { mount } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import { VLayout } from "vuetify/components";
import type { Component } from "vue";

const vuetify = createVuetify();

/**
 * Mount a component with Vuetify plugin installed.
 * Replacement for `mountSuspended` that doesn't require Nuxt runtime.
 */
export function mountWithVuetify(component: Component, options: Record<string, any> = {}) {
  const { global: globalOptions, ...restOptions } = options;
  const { stubs: extraStubs, ...restGlobalOptions } = globalOptions || {};

  return mount(component, {
    global: {
      plugins: [vuetify],
      components: { VLayout },
      stubs: {
        NuxtLoadingIndicator: true,
        NuxtLayout: true,
        NuxtPage: true,
        NuxtTime: { template: "<span>mocked-time</span>" },
        LoadingOverlay: true,
        ...extraStubs,
      },
      ...restGlobalOptions,
    },
    ...restOptions,
  });
}
