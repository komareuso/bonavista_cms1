import { describe, expect, it } from "vitest";
import { isConfiguredAdminEmail } from "./db";

describe("isConfiguredAdminEmail", () => {
  it("treats komareusa@gmail.com as an admin email by default", () => {
    expect(isConfiguredAdminEmail("komareusa@gmail.com")).toBe(true);
  });

  it("matches admin emails case-insensitively", () => {
    expect(isConfiguredAdminEmail("Komareusa@Gmail.com")).toBe(true);
  });

  it("does not grant admin access to unrelated emails", () => {
    expect(isConfiguredAdminEmail("other@example.com")).toBe(false);
  });
});
