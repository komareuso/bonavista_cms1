import { describe, expect, it } from "vitest";
import { getAdminRouteState } from "./AdminRoute";

describe("getAdminRouteState", () => {
  it("returns loading while auth state is pending", () => {
    expect(getAdminRouteState({ loading: true, isAuthenticated: false, role: null })).toBe("loading");
  });

  it("sends anonymous visitors to the login flow", () => {
    expect(getAdminRouteState({ loading: false, isAuthenticated: false, role: null })).toBe("login");
  });

  it("redirects authenticated non-admin users", () => {
    expect(getAdminRouteState({ loading: false, isAuthenticated: true, role: "user" })).toBe("redirect");
  });

  it("allows authenticated admins", () => {
    expect(getAdminRouteState({ loading: false, isAuthenticated: true, role: "admin" })).toBe("allow");
  });
});
