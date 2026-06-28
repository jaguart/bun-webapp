import { describe, expect, test } from "bun:test";
import { hasCapability } from "../../src/infra/acl";

describe("hasCapability", () => {
  test("returns true for a matching capability", () => {
    expect(hasCapability("admin", "admin")).toBe(true);
  });

  test("returns true when capability is one of several", () => {
    expect(hasCapability("read;write;admin", "write")).toBe(true);
  });

  test("returns false when capability is absent", () => {
    expect(hasCapability("read;write", "admin")).toBe(false);
  });

  test("returns false for empty capabilities string", () => {
    expect(hasCapability("", "admin")).toBe(false);
  });

  test("trims whitespace around semicolons", () => {
    expect(hasCapability("read ; admin ; write", "admin")).toBe(true);
  });

  test("is case-sensitive", () => {
    expect(hasCapability("Admin", "admin")).toBe(false);
  });

  test("does not partial-match within a capability", () => {
    expect(hasCapability("superadmin", "admin")).toBe(false);
  });
});
