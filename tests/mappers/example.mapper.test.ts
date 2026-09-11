import { describe, it, expect } from "vitest";
import { mapExample } from "~/mappers/example.mapper";
import type { ExampleDTO } from "~/types";

describe("mapExample", () => {
  const mockDTO: ExampleDTO = {
    user_id: 42,
    full_name: "สมชาย ใจดี",
    email: "somchai@example.com",
    role: "admin",
    created_at: "2025-01-15T10:30:00Z",
  };

  it("should map user_id to id", () => {
    const result = mapExample(mockDTO);
    expect(result.id).toBe(42);
  });

  it("should map full_name to name", () => {
    const result = mapExample(mockDTO);
    expect(result.name).toBe("สมชาย ใจดี");
  });

  it("should map email directly", () => {
    const result = mapExample(mockDTO);
    expect(result.email).toBe("somchai@example.com");
  });

  it("should map role directly", () => {
    const result = mapExample(mockDTO);
    expect(result.role).toBe("admin");
  });

  it("should map created_at to createdAt", () => {
    const result = mapExample(mockDTO);
    expect(result.createdAt).toBe("2025-01-15T10:30:00Z");
  });

  it("should return correct shape with all fields", () => {
    const result = mapExample(mockDTO);
    expect(result).toEqual({
      id: 42,
      name: "สมชาย ใจดี",
      email: "somchai@example.com",
      role: "admin",
      createdAt: "2025-01-15T10:30:00Z",
    });
  });

  it("should handle empty strings", () => {
    const emptyDTO: ExampleDTO = {
      user_id: 0,
      full_name: "",
      email: "",
      role: "",
      created_at: "",
    };
    const result = mapExample(emptyDTO);
    expect(result).toEqual({
      id: 0,
      name: "",
      email: "",
      role: "",
      createdAt: "",
    });
  });
});
