import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import {
  getAdminYacht,
  getDashboardStats,
  getPublishedYachtBySlug,
  listAdminYachts,
  listPublishedYachts,
  saveYacht,
} from "./db";
import { storagePut } from "./storage";

const keyValueSchema = z.object({
  key: z.string().trim().default(""),
  value: z.string().trim().default(""),
});

const photoSchema = z.object({
  id: z.number().int().optional(),
  url: z.string().url(),
  storageKey: z.string().trim().min(1),
  isCover: z.boolean(),
});

const pricingTierSchema = z.object({
  seasonLabel: z.string().trim().default(""),
  minHours: z.number().int().nonnegative().nullable(),
  minGuests: z.number().int().nonnegative().nullable(),
  maxGuests: z.number().int().nonnegative().nullable(),
  price: z.number().int().nonnegative().nullable(),
  currency: z.string().trim().min(1).default("EUR"),
  notes: z.string().trim().default(""),
});

const extraFeeSchema = z.object({
  feeType: z.string().trim().default(""),
  label: z.string().trim().default(""),
  pricingModel: z.string().trim().default(""),
  amount: z.number().int().nonnegative().nullable(),
  currency: z.string().trim().min(1).default("EUR"),
  unitLabel: z.string().trim().default(""),
  notes: z.string().trim().default(""),
});

export const yachtEditorSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().default(""),
  type: z.string().trim().default(""),
  status: z.enum(["draft", "published"]),
  guestCapacity: z.number().int().nonnegative().nullable(),
  price: z.number().int().nonnegative().nullable(),
  description: z.string().trim().default(""),
  marinaName: z.string().trim().default(""),
  city: z.string().trim().default(""),
  country: z.string().trim().default(""),
  berthLocationText: z.string().trim().default(""),
  latitude: z.string().trim().default(""),
  longitude: z.string().trim().default(""),
  rentalType: z.string().trim().default(""),
  captainIncluded: z.boolean().default(false),
  crewIncluded: z.boolean().default(false),
  minimumOrderHours: z.number().int().nonnegative().nullish().transform((value) => value ?? null),
  minimumOrderUnit: z.string().trim().default("hours"),
  lengthValue: z.string().trim().default(""),
  lengthUnit: z.string().trim().default("m"),
  beamValue: z.string().trim().default(""),
  beamUnit: z.string().trim().default("m"),
  draftValue: z.string().trim().default(""),
  draftUnit: z.string().trim().default("m"),
  yearBuilt: z.number().int().nonnegative().nullish().transform((value) => value ?? null),
  modelName: z.string().trim().default(""),
  boatCategory: z.string().trim().default(""),
  internalReferenceId: z.string().trim().default(""),
  toiletsCount: z.number().int().nonnegative().nullish().transform((value) => value ?? null),
  engineSpec: z.string().trim().default(""),
  cruisingSpeedValue: z.string().trim().default(""),
  cruisingSpeedUnit: z.string().trim().default("knots"),
  currency: z.string().trim().default("EUR"),
  pricingMode: z.enum(["fixed", "tiered"]).default("fixed"),
  basePriceLabel: z.string().trim().default(""),
  vatIncluded: z.boolean().default(false),
  vatRate: z.string().trim().default(""),
  pricingNotes: z.string().trim().default(""),
  heroBadge: z.string().trim().default(""),
  shortLocationLabel: z.string().trim().default(""),
  ctaPrimaryLabel: z.string().trim().default("Request to book"),
  ctaSecondaryLabel: z.string().trim().default("Contact us"),
  bookingHelpText: z.string().trim().default(""),
  extraServiceNotes: z.string().trim().default(""),
  serviceStaffRatioText: z.string().trim().default(""),
  smokingAllowed: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  partyAllowed: z.boolean().default(false),
  childrenAllowed: z.boolean().default(false),
  rulesNotes: z.string().trim().default(""),
  reviewsEnabled: z.boolean().default(false),
  reviewCount: z.number().int().nonnegative().nullish().transform((value) => value ?? null),
  verifiedReviewsOnly: z.boolean().default(false),
  similarBoatsEnabled: z.boolean().default(false),
  details: z.array(z.string().trim()).default([]),
  amenities: z.array(z.string().trim()).default([]),
  includedServices: z.array(z.string().trim()).default([]),
  equipment: z.array(z.string().trim()).default([]),
  features: z.array(keyValueSchema).default([]),
  customFields: z.array(keyValueSchema).default([]),
  pricingTiers: z.array(pricingTierSchema).default([]),
  extraFees: z.array(extraFeeSchema).default([]),
  photos: z.array(photoSchema).default([]),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  yachts: router({
    publicList: publicProcedure.query(async () => {
      return listPublishedYachts();
    }),
    publicBySlug: publicProcedure
      .input(z.object({ slug: z.string().trim().min(1) }))
      .query(async ({ input }) => {
        return getPublishedYachtBySlug(input.slug);
      }),
    adminList: adminProcedure.query(async () => {
      return listAdminYachts();
    }),
    dashboard: adminProcedure.query(async () => {
      return getDashboardStats();
    }),
    getEditor: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        return getAdminYacht(input.id);
      }),
    save: adminProcedure
      .input(yachtEditorSchema)
      .mutation(async ({ ctx, input }) => {
        return saveYacht(input, ctx.user.id);
      }),
    uploadPhoto: adminProcedure
      .input(
        z.object({
          fileName: z.string().trim().min(1),
          mimeType: z.string().trim().min(1),
          base64: z.string().trim().min(1),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const cleanName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
        const bytes = Buffer.from(input.base64, "base64");
        const upload = await storagePut(
          `bonavista/yachts/${ctx.user.id}/${Date.now()}-${cleanName}`,
          bytes,
          input.mimeType,
        );
        return upload;
      }),
  }),
});

export type AppRouter = typeof appRouter;
