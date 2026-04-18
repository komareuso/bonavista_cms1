import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminRouteState } from "../client/src/components/AdminRoute";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

const dbMocks = vi.hoisted(() => ({
  getDashboardStats: vi.fn(),
  listAdminYachts: vi.fn(),
  getAdminYacht: vi.fn(),
  saveYacht: vi.fn(),
  listPublishedYachts: vi.fn(),
  getPublishedYachtBySlug: vi.fn(),
}));

const storageMocks = vi.hoisted(() => ({
  storagePut: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./storage", () => storageMocks);

type Role = "admin" | "user";

function createContext(role: Role): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 7 : 8,
      openId: `${role}-open-id`,
      name: `${role} user`,
      email: `${role}@bonavista.test`,
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("yachts router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks non-admin users from the admin list", async () => {
    const caller = appRouter.createCaller(createContext("user"));
    await expect(caller.yachts.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("returns dashboard stats for admins", async () => {
    dbMocks.getDashboardStats.mockResolvedValue({ total: 5, published: 3, draft: 2 });
    const caller = appRouter.createCaller(createContext("admin"));

    await expect(caller.yachts.dashboard()).resolves.toEqual({ total: 5, published: 3, draft: 2 });
  });

  it("saves a yacht using the authenticated admin id", async () => {
    dbMocks.saveYacht.mockResolvedValue({ id: 11, slug: "bonavista-42" });
    const caller = appRouter.createCaller(createContext("admin"));

    const payload = {
      name: "Bonavista 42",
      type: "Catamaran",
      status: "draft" as const,
      guestCapacity: 12,
      price: 3200,
      description: "Flagship charter yacht",
      details: ["First paragraph"],
      amenities: ["Wi-Fi"],
      features: [{ key: "Cabins", value: "4" }],
      customFields: [{ key: "Designer", value: "Studio" }],
      photos: [{ url: "https://cdn.example.com/cover.jpg", storageKey: "bonavista/key.jpg", isCover: true }],
    };

    await expect(caller.yachts.save(payload)).resolves.toEqual({ id: 11, slug: "bonavista-42" });
    expect(dbMocks.saveYacht).toHaveBeenCalledWith(
      expect.objectContaining({
        ...payload,
        pricingMode: "fixed",
        currency: "EUR",
        minimumOrderHours: null,
        yearBuilt: null,
        toiletsCount: null,
        reviewCount: null,
        includedServices: [],
        equipment: [],
        pricingTiers: [],
        extraFees: [],
      }),
      7,
    );
  });

  it("uploads photos into storage for admins", async () => {
    storageMocks.storagePut.mockResolvedValue({ key: "bonavista/file.jpg", url: "https://cdn.example.com/file.jpg" });
    const caller = appRouter.createCaller(createContext("admin"));

    const response = await caller.yachts.uploadPhoto({
      fileName: "cover.jpg",
      mimeType: "image/jpeg",
      base64: Buffer.from("demo").toString("base64"),
    });

    expect(response).toEqual({ key: "bonavista/file.jpg", url: "https://cdn.example.com/file.jpg" });
    expect(storageMocks.storagePut).toHaveBeenCalledTimes(1);
  });

  it("returns public yachts from the database-backed catalog", async () => {
    dbMocks.listPublishedYachts.mockResolvedValue([{ id: 1, slug: "lagoon-52" }]);
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.yachts.publicList()).resolves.toEqual([{ id: 1, slug: "lagoon-52" }]);
  });

  it("distinguishes login flow, non-admin redirect, and admin access", () => {
    expect(getAdminRouteState({ loading: false, isAuthenticated: true, role: "user" })).toBe("redirect");
    expect(getAdminRouteState({ loading: false, isAuthenticated: false, role: null })).toBe("login");
    expect(getAdminRouteState({ loading: false, isAuthenticated: true, role: "admin" })).toBe("allow");
  });
});
