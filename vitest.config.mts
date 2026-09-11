import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reportsDirectory: "coverage",
      provider: "istanbul",
      reporter: ["lcov"],
      clean: false,
    },
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
