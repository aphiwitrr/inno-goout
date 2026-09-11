import { afterAll } from "vitest";

// Nuxt internal uses setTimeout → $fetch to load app manifest.
// After test teardown, vitest restores mocks but the timer still fires.
// Fix: assign $fetch to globalThis permanently AND clear timers after tests.

// Ensure $fetch always exists (even after vi.restoreAllMocks)
const noop$fetch = (..._args: unknown[]) => Promise.resolve({});
Object.defineProperty(globalThis, "$fetch", {
  value: noop$fetch,
  writable: true,
  configurable: true,
});

afterAll(() => {
  globalThis.$fetch = noop$fetch as any;
});
