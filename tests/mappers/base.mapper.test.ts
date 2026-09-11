import { describe, it, expect } from "vitest";
import { mapArray, mapNullable } from "~/mappers/base.mapper";

describe("mapArray", () => {
  it("should map array with given mapper function", () => {
    const items = [1, 2, 3];
    const result = mapArray(items, (n) => n * 2);
    expect(result).toEqual([2, 4, 6]);
  });

  it("should return empty array when input is empty", () => {
    const result = mapArray([], (n: number) => n * 2);
    expect(result).toEqual([]);
  });

  it("should transform objects", () => {
    const items = [{ name: "a" }, { name: "b" }];
    const result = mapArray(items, (item) => item.name.toUpperCase());
    expect(result).toEqual(["A", "B"]);
  });

  it("should preserve array length", () => {
    const items = [1, 2, 3, 4, 5];
    const result = mapArray(items, (n) => String(n));
    expect(result).toHaveLength(5);
  });
});

describe("mapNullable", () => {
  it("should return null when value is null", () => {
    const result = mapNullable(null, (v: string) => v.toUpperCase());
    expect(result).toBeNull();
  });

  it("should return null when value is undefined", () => {
    const result = mapNullable(undefined, (v: string) => v.toUpperCase());
    expect(result).toBeNull();
  });

  it("should apply mapper when value exists", () => {
    const result = mapNullable("hello", (v) => v.toUpperCase());
    expect(result).toBe("HELLO");
  });

  it("should handle 0 as valid value (not null)", () => {
    const result = mapNullable(0, (v) => v + 1);
    expect(result).toBe(1);
  });

  it("should handle empty string as valid value (not null)", () => {
    const result = mapNullable("", (v) => `prefix-${v}`);
    expect(result).toBe("prefix-");
  });

  it("should handle false as valid value (not null)", () => {
    const result = mapNullable(false, (v) => !v);
    expect(result).toBe(true);
  });

  it("should transform objects", () => {
    const obj = { id: 1, name: "test" };
    const result = mapNullable(obj, (v) => v.name);
    expect(result).toBe("test");
  });
});
