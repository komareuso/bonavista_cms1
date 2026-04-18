import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Router as WouterRouter } from "wouter";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: 2,
      role: "user",
      openId: "user-open-id",
      email: "user@bonavista.test",
      name: "Regular User",
      loginMethod: "manus",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    loading: false,
    isAuthenticated: true,
  }),
}));

vi.mock("./routers", () => ({
  appRouter: {} as never,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    createClient: vi.fn(),
    yachts: {
      publicList: { useQuery: () => ({ data: [], isLoading: false }) },
      publicBySlug: { useQuery: () => ({ data: null, isLoading: false }) },
      dashboard: { useQuery: () => ({ data: { total: 0, published: 0, draft: 0 }, isLoading: false }) },
      adminList: { useQuery: () => ({ data: [], isLoading: false }) },
      getEditor: { useQuery: () => ({ data: null, isLoading: false }) },
      save: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
      uploadPhoto: { useMutation: () => ({ mutateAsync: vi.fn(), isPending: false }) },
    },
    useUtils: () => ({
      yachts: {
        adminList: { invalidate: vi.fn() },
        dashboard: { invalidate: vi.fn() },
        publicList: { invalidate: vi.fn() },
        publicBySlug: { invalidate: vi.fn() },
      },
    }),
  },
}));

import { Router } from "../client/src/App";

describe("app admin routing", () => {
  it("renders redirect state for non-admin access to /cms", () => {
    const useTestLocation = () => ["/cms", vi.fn()] as [string, (path: string, ...args: unknown[]) => unknown];

    const html = renderToStaticMarkup(
      <WouterRouter hook={useTestLocation}>
        <Router />
      </WouterRouter>,
    );

    expect(html).toContain("Redirecting...");
    expect(html).not.toContain("Fleet administration dashboard");
  });
});
