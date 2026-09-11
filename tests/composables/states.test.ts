import { describe, it, expect, vi, beforeEach } from "vitest";
import type { LoginInfoType } from "~/types";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

import { useLoginInfo } from "~/composables/states";

const {
  mockUseState,
} = vi.hoisted(() => ({
  mockUseState: vi.fn(),
}));

mockNuxtImport("useState", () => mockUseState);

describe("useLoginInfo", () => {
  beforeEach(() => {
    mockUseState.mockReset();
  });

  it("should call useState with correct key and default", () => {
    const fakeRef = { value: null };
    mockUseState.mockReturnValue(fakeRef);
    const result = useLoginInfo();
    expect(mockUseState).toHaveBeenCalledWith("loginInfo", expect.any(Function));
    expect(result).toBe(fakeRef);
  });

  it("should initialize with null by default", () => {
    let defaultValue: LoginInfoType | null = "not-set" as LoginInfoType | null;
    mockUseState.mockImplementation((_key, fn) => {
      defaultValue = fn();
      return { value: defaultValue };
    });
    const result = useLoginInfo();
    expect(defaultValue).toBeNull();
    expect(result.value).toBeNull();
  });

  it("should allow updating the loginInfo value", () => {
    const refObj = { value: null };
    mockUseState.mockReturnValue(refObj);
    const loginInfo = useLoginInfo();
    const fakeData = { boraEmployee: { id: "1" } } as LoginInfoType;
    loginInfo.value = fakeData;
    expect(loginInfo.value).toStrictEqual(fakeData);
  });
});
