import { asc, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  yachtAmenities,
  yachtCustomFields,
  yachtDetails,
  yachtEquipment,
  yachtExtraFees,
  yachtFeatures,
  yachtIncludedServices,
  yachtPhotos,
  yachtPricingTiers,
  yachts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export function isConfiguredAdminEmail(email?: string | null) {
  if (!email) return false;

  const configuredEmails = (process.env.BONAVISTA_ADMIN_EMAILS ?? "komareusa@gmail.com")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return configuredEmails.includes(email.trim().toLowerCase());
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    values[field] = value ?? null;
    updateSet[field] = value ?? null;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId || isConfiguredAdminEmail(user.email)) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

type KeyValueInput = { key: string; value: string };
type PhotoInput = { id?: number; url: string; storageKey: string; isCover: boolean };
export type PricingTierInput = {
  seasonLabel: string;
  minHours: number | null;
  minGuests: number | null;
  maxGuests: number | null;
  price: number | null;
  currency: string;
  notes: string;
};
export type ExtraFeeInput = {
  feeType: string;
  label: string;
  pricingModel: string;
  amount: number | null;
  currency: string;
  unitLabel: string;
  notes: string;
};

export type YachtEditorInput = {
  id?: number;
  name: string;
  type: string;
  status: "draft" | "published";
  guestCapacity: number | null;
  price: number | null;
  description: string;
  marinaName: string;
  city: string;
  country: string;
  berthLocationText: string;
  latitude: string;
  longitude: string;
  rentalType: string;
  captainIncluded: boolean;
  crewIncluded: boolean;
  minimumOrderHours: number | null;
  minimumOrderUnit: string;
  lengthValue: string;
  lengthUnit: string;
  beamValue: string;
  beamUnit: string;
  draftValue: string;
  draftUnit: string;
  yearBuilt: number | null;
  modelName: string;
  boatCategory: string;
  internalReferenceId: string;
  toiletsCount: number | null;
  engineSpec: string;
  cruisingSpeedValue: string;
  cruisingSpeedUnit: string;
  currency: string;
  pricingMode: "fixed" | "tiered";
  basePriceLabel: string;
  vatIncluded: boolean;
  vatRate: string;
  pricingNotes: string;
  heroBadge: string;
  shortLocationLabel: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  bookingHelpText: string;
  extraServiceNotes: string;
  serviceStaffRatioText: string;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partyAllowed: boolean;
  childrenAllowed: boolean;
  rulesNotes: string;
  reviewsEnabled: boolean;
  reviewCount: number | null;
  verifiedReviewsOnly: boolean;
  similarBoatsEnabled: boolean;
  details: string[];
  amenities: string[];
  includedServices: string[];
  equipment: string[];
  features: KeyValueInput[];
  customFields: KeyValueInput[];
  pricingTiers: PricingTierInput[];
  extraFees: ExtraFeeInput[];
  photos: PhotoInput[];
};

export type YachtRecord = {
  id: number;
  slug: string;
  name: string;
  type: string;
  status: "draft" | "published";
  guestCapacity: number | null;
  price: number | null;
  description: string;
  coverPhotoUrl: string | null;
  coverPhotoKey: string | null;
  marinaName: string | null;
  city: string | null;
  country: string | null;
  berthLocationText: string | null;
  latitude: string | null;
  longitude: string | null;
  rentalType: string | null;
  captainIncluded: boolean;
  crewIncluded: boolean;
  minimumOrderHours: number | null;
  minimumOrderUnit: string | null;
  lengthValue: string | null;
  lengthUnit: string | null;
  beamValue: string | null;
  beamUnit: string | null;
  draftValue: string | null;
  draftUnit: string | null;
  yearBuilt: number | null;
  modelName: string | null;
  boatCategory: string | null;
  internalReferenceId: string | null;
  toiletsCount: number | null;
  engineSpec: string | null;
  cruisingSpeedValue: string | null;
  cruisingSpeedUnit: string | null;
  currency: string | null;
  pricingMode: "fixed" | "tiered";
  basePriceLabel: string | null;
  vatIncluded: boolean;
  vatRate: string | null;
  pricingNotes: string | null;
  heroBadge: string | null;
  shortLocationLabel: string | null;
  ctaPrimaryLabel: string | null;
  ctaSecondaryLabel: string | null;
  bookingHelpText: string | null;
  extraServiceNotes: string | null;
  serviceStaffRatioText: string | null;
  smokingAllowed: boolean;
  petsAllowed: boolean;
  partyAllowed: boolean;
  childrenAllowed: boolean;
  rulesNotes: string | null;
  reviewsEnabled: boolean;
  reviewCount: number | null;
  verifiedReviewsOnly: boolean;
  similarBoatsEnabled: boolean;
  photos: Array<{ id: number; url: string; storageKey: string; isCover: boolean; sortOrder: number }>;
  details: Array<{ id: number; content: string; sortOrder: number }>;
  amenities: Array<{ id: number; label: string; sortOrder: number }>;
  includedServices: Array<{ id: number; label: string; sortOrder: number }>;
  equipment: Array<{ id: number; label: string; sortOrder: number }>;
  features: Array<{ id: number; key: string; value: string; sortOrder: number }>;
  customFields: Array<{ id: number; key: string; value: string; sortOrder: number }>;
  pricingTiers: Array<{ id: number; seasonLabel: string; minHours: number | null; minGuests: number | null; maxGuests: number | null; price: number; currency: string; notes: string | null; sortOrder: number }>;
  extraFees: Array<{ id: number; feeType: string | null; label: string; pricingModel: string | null; amount: number | null; currency: string | null; unitLabel: string | null; notes: string | null; sortOrder: number }>;
  createdAt: Date;
  updatedAt: Date;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 140);
}

function trimOrNull(value?: string | null) {
  const cleaned = value?.trim() ?? "";
  return cleaned.length ? cleaned : null;
}

function decimalOrNull(value?: string | null) {
  const cleaned = value?.trim() ?? "";
  if (!cleaned.length) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? cleaned : null;
}

function mapBoolean(value: number | null | undefined) {
  return value === 1;
}

function mapYachtBase(base: typeof yachts.$inferSelect) {
  return {
    ...base,
    latitude: base.latitude?.toString() ?? null,
    longitude: base.longitude?.toString() ?? null,
    captainIncluded: mapBoolean(base.captainIncluded),
    crewIncluded: mapBoolean(base.crewIncluded),
    lengthValue: base.lengthValue?.toString() ?? null,
    beamValue: base.beamValue?.toString() ?? null,
    draftValue: base.draftValue?.toString() ?? null,
    cruisingSpeedValue: base.cruisingSpeedValue?.toString() ?? null,
    vatIncluded: mapBoolean(base.vatIncluded),
    vatRate: base.vatRate?.toString() ?? null,
    smokingAllowed: mapBoolean(base.smokingAllowed),
    petsAllowed: mapBoolean(base.petsAllowed),
    partyAllowed: mapBoolean(base.partyAllowed),
    childrenAllowed: mapBoolean(base.childrenAllowed),
    reviewsEnabled: mapBoolean(base.reviewsEnabled),
    verifiedReviewsOnly: mapBoolean(base.verifiedReviewsOnly),
    similarBoatsEnabled: mapBoolean(base.similarBoatsEnabled),
  };
}

async function ensureUniqueSlug(name: string, excludeId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const base = slugify(name) || "yacht";
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = (await db.select().from(yachts).where(eq(yachts.slug, slug)).limit(1))[0];
    if (!existing || existing.id === excludeId) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { total: 0, published: 0, draft: 0 };

  const rows = await db.select({ status: yachts.status }).from(yachts);
  return {
    total: rows.length,
    published: rows.filter((row) => row.status === "published").length,
    draft: rows.filter((row) => row.status === "draft").length,
  };
}

export async function listAdminYachts() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: yachts.id,
      slug: yachts.slug,
      name: yachts.name,
      type: yachts.type,
      status: yachts.status,
      guestCapacity: yachts.guestCapacity,
      price: yachts.price,
      coverPhotoUrl: yachts.coverPhotoUrl,
      marinaName: yachts.marinaName,
      city: yachts.city,
      updatedAt: yachts.updatedAt,
    })
    .from(yachts)
    .orderBy(desc(yachts.updatedAt), asc(yachts.name));
}

async function loadYachtRelations(yachtId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [
    detailsRows,
    amenityRows,
    includedServiceRows,
    equipmentRows,
    featureRows,
    customFieldRows,
    pricingTierRows,
    extraFeeRows,
    photoRows,
  ] = await Promise.all([
    db.select().from(yachtDetails).where(eq(yachtDetails.yachtId, yachtId)).orderBy(asc(yachtDetails.sortOrder), asc(yachtDetails.id)),
    db.select().from(yachtAmenities).where(eq(yachtAmenities.yachtId, yachtId)).orderBy(asc(yachtAmenities.sortOrder), asc(yachtAmenities.id)),
    db.select().from(yachtIncludedServices).where(eq(yachtIncludedServices.yachtId, yachtId)).orderBy(asc(yachtIncludedServices.sortOrder), asc(yachtIncludedServices.id)),
    db.select().from(yachtEquipment).where(eq(yachtEquipment.yachtId, yachtId)).orderBy(asc(yachtEquipment.sortOrder), asc(yachtEquipment.id)),
    db.select().from(yachtFeatures).where(eq(yachtFeatures.yachtId, yachtId)).orderBy(asc(yachtFeatures.sortOrder), asc(yachtFeatures.id)),
    db.select().from(yachtCustomFields).where(eq(yachtCustomFields.yachtId, yachtId)).orderBy(asc(yachtCustomFields.sortOrder), asc(yachtCustomFields.id)),
    db.select().from(yachtPricingTiers).where(eq(yachtPricingTiers.yachtId, yachtId)).orderBy(asc(yachtPricingTiers.sortOrder), asc(yachtPricingTiers.id)),
    db.select().from(yachtExtraFees).where(eq(yachtExtraFees.yachtId, yachtId)).orderBy(asc(yachtExtraFees.sortOrder), asc(yachtExtraFees.id)),
    db.select().from(yachtPhotos).where(eq(yachtPhotos.yachtId, yachtId)).orderBy(asc(yachtPhotos.sortOrder), asc(yachtPhotos.id)),
  ]);

  return {
    details: detailsRows.map((item) => ({ id: item.id, content: item.content, sortOrder: item.sortOrder })),
    amenities: amenityRows.map((item) => ({ id: item.id, label: item.label, sortOrder: item.sortOrder })),
    includedServices: includedServiceRows.map((item) => ({ id: item.id, label: item.label, sortOrder: item.sortOrder })),
    equipment: equipmentRows.map((item) => ({ id: item.id, label: item.label, sortOrder: item.sortOrder })),
    features: featureRows.map((item) => ({ id: item.id, key: item.featureKey, value: item.featureValue, sortOrder: item.sortOrder })),
    customFields: customFieldRows.map((item) => ({ id: item.id, key: item.fieldKey, value: item.fieldValue, sortOrder: item.sortOrder })),
    pricingTiers: pricingTierRows.map((item) => ({ id: item.id, seasonLabel: item.seasonLabel, minHours: item.minHours, minGuests: item.minGuests, maxGuests: item.maxGuests, price: item.price, currency: item.currency, notes: item.notes, sortOrder: item.sortOrder })),
    extraFees: extraFeeRows.map((item) => ({ id: item.id, feeType: item.feeType, label: item.label, pricingModel: item.pricingModel, amount: item.amount, currency: item.currency, unitLabel: item.unitLabel, notes: item.notes, sortOrder: item.sortOrder })),
    photos: photoRows.map((item) => ({ id: item.id, url: item.url, storageKey: item.storageKey, isCover: item.isCover === 1, sortOrder: item.sortOrder })),
  };
}

function normalizeEditorInput(input: YachtEditorInput) {
  return {
    name: input.name.trim(),
    type: input.type.trim(),
    status: input.status,
    guestCapacity: input.guestCapacity ?? null,
    price: input.price ?? null,
    description: input.description.trim(),
    marinaName: trimOrNull(input.marinaName),
    city: trimOrNull(input.city),
    country: trimOrNull(input.country),
    berthLocationText: trimOrNull(input.berthLocationText),
    latitude: decimalOrNull(input.latitude),
    longitude: decimalOrNull(input.longitude),
    rentalType: trimOrNull(input.rentalType),
    captainIncluded: input.captainIncluded,
    crewIncluded: input.crewIncluded,
    minimumOrderHours: input.minimumOrderHours ?? null,
    minimumOrderUnit: trimOrNull(input.minimumOrderUnit) ?? "hours",
    lengthValue: decimalOrNull(input.lengthValue),
    lengthUnit: trimOrNull(input.lengthUnit),
    beamValue: decimalOrNull(input.beamValue),
    beamUnit: trimOrNull(input.beamUnit),
    draftValue: decimalOrNull(input.draftValue),
    draftUnit: trimOrNull(input.draftUnit),
    yearBuilt: input.yearBuilt ?? null,
    modelName: trimOrNull(input.modelName),
    boatCategory: trimOrNull(input.boatCategory),
    internalReferenceId: trimOrNull(input.internalReferenceId),
    toiletsCount: input.toiletsCount ?? null,
    engineSpec: trimOrNull(input.engineSpec),
    cruisingSpeedValue: decimalOrNull(input.cruisingSpeedValue),
    cruisingSpeedUnit: trimOrNull(input.cruisingSpeedUnit),
    currency: trimOrNull(input.currency) ?? "EUR",
    pricingMode: input.pricingMode,
    basePriceLabel: trimOrNull(input.basePriceLabel),
    vatIncluded: input.vatIncluded,
    vatRate: decimalOrNull(input.vatRate),
    pricingNotes: trimOrNull(input.pricingNotes),
    heroBadge: trimOrNull(input.heroBadge),
    shortLocationLabel: trimOrNull(input.shortLocationLabel),
    ctaPrimaryLabel: trimOrNull(input.ctaPrimaryLabel),
    ctaSecondaryLabel: trimOrNull(input.ctaSecondaryLabel),
    bookingHelpText: trimOrNull(input.bookingHelpText),
    extraServiceNotes: trimOrNull(input.extraServiceNotes),
    serviceStaffRatioText: trimOrNull(input.serviceStaffRatioText),
    smokingAllowed: input.smokingAllowed,
    petsAllowed: input.petsAllowed,
    partyAllowed: input.partyAllowed,
    childrenAllowed: input.childrenAllowed,
    rulesNotes: trimOrNull(input.rulesNotes),
    reviewsEnabled: input.reviewsEnabled,
    reviewCount: input.reviewCount ?? null,
    verifiedReviewsOnly: input.verifiedReviewsOnly,
    similarBoatsEnabled: input.similarBoatsEnabled,
    details: input.details.map((item) => item.trim()).filter(Boolean),
    amenities: input.amenities.map((item) => item.trim()).filter(Boolean),
    includedServices: input.includedServices.map((item) => item.trim()).filter(Boolean),
    equipment: input.equipment.map((item) => item.trim()).filter(Boolean),
    features: input.features.map((item) => ({ key: item.key.trim(), value: item.value.trim() })).filter((item) => item.key && item.value),
    customFields: input.customFields.map((item) => ({ key: item.key.trim(), value: item.value.trim() })).filter((item) => item.key && item.value),
    pricingTiers: input.pricingTiers
      .map((item) => ({
        seasonLabel: item.seasonLabel.trim(),
        minHours: item.minHours ?? null,
        minGuests: item.minGuests ?? null,
        maxGuests: item.maxGuests ?? null,
        price: item.price ?? null,
        currency: item.currency.trim() || "EUR",
        notes: trimOrNull(item.notes),
      }))
      .filter((item) => item.seasonLabel && item.price !== null),
    extraFees: input.extraFees
      .map((item) => ({
        feeType: trimOrNull(item.feeType),
        label: item.label.trim(),
        pricingModel: trimOrNull(item.pricingModel),
        amount: item.amount ?? null,
        currency: item.currency.trim() || "EUR",
        unitLabel: trimOrNull(item.unitLabel),
        notes: trimOrNull(item.notes),
      }))
      .filter((item) => item.label),
    photos: input.photos.map((item) => ({ ...item, storageKey: item.storageKey.trim(), url: item.url.trim() })).filter((item) => item.storageKey && item.url),
  };
}

export async function getAdminYacht(id: number): Promise<YachtRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const base = (await db.select().from(yachts).where(eq(yachts.id, id)).limit(1))[0];
  if (!base) return null;

  const relations = await loadYachtRelations(base.id);
  return { ...mapYachtBase(base), ...relations } as YachtRecord;
}

export async function saveYacht(input: YachtEditorInput, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const normalized = normalizeEditorInput(input);
  if (normalized.status === "published") {
    if (!normalized.name) throw new Error("Yacht name is required before publishing");
    if (!normalized.type) throw new Error("Yacht type is required before publishing");
    if (!normalized.description) throw new Error("Yacht description is required before publishing");
  }

  const effectiveName = normalized.name || "Untitled yacht draft";
  const effectiveType = normalized.type || "Draft";
  const effectiveDescription = normalized.description || "Draft yacht entry";

  const slug = await ensureUniqueSlug(effectiveName, input.id);
  const cover = normalized.photos.find((photo) => photo.isCover) ?? normalized.photos[0] ?? null;

  const yachtId = await db.transaction(async (tx) => {
    let id = input.id;

    const sharedValues = {
      slug,
      name: effectiveName,
      type: effectiveType,
      status: normalized.status,
      guestCapacity: normalized.guestCapacity,
      price: normalized.price,
      description: effectiveDescription,
      coverPhotoUrl: cover?.url ?? null,
      coverPhotoKey: cover?.storageKey ?? null,
      marinaName: normalized.marinaName,
      city: normalized.city,
      country: normalized.country,
      berthLocationText: normalized.berthLocationText,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
      rentalType: normalized.rentalType,
      captainIncluded: normalized.captainIncluded ? 1 : 0,
      crewIncluded: normalized.crewIncluded ? 1 : 0,
      minimumOrderHours: normalized.minimumOrderHours,
      minimumOrderUnit: normalized.minimumOrderUnit,
      lengthValue: normalized.lengthValue,
      lengthUnit: normalized.lengthUnit,
      beamValue: normalized.beamValue,
      beamUnit: normalized.beamUnit,
      draftValue: normalized.draftValue,
      draftUnit: normalized.draftUnit,
      yearBuilt: normalized.yearBuilt,
      modelName: normalized.modelName,
      boatCategory: normalized.boatCategory,
      internalReferenceId: normalized.internalReferenceId,
      toiletsCount: normalized.toiletsCount,
      engineSpec: normalized.engineSpec,
      cruisingSpeedValue: normalized.cruisingSpeedValue,
      cruisingSpeedUnit: normalized.cruisingSpeedUnit,
      currency: normalized.currency,
      pricingMode: normalized.pricingMode,
      basePriceLabel: normalized.basePriceLabel,
      vatIncluded: normalized.vatIncluded ? 1 : 0,
      vatRate: normalized.vatRate,
      pricingNotes: normalized.pricingNotes,
      heroBadge: normalized.heroBadge,
      shortLocationLabel: normalized.shortLocationLabel,
      ctaPrimaryLabel: normalized.ctaPrimaryLabel,
      ctaSecondaryLabel: normalized.ctaSecondaryLabel,
      bookingHelpText: normalized.bookingHelpText,
      extraServiceNotes: normalized.extraServiceNotes,
      serviceStaffRatioText: normalized.serviceStaffRatioText,
      smokingAllowed: normalized.smokingAllowed ? 1 : 0,
      petsAllowed: normalized.petsAllowed ? 1 : 0,
      partyAllowed: normalized.partyAllowed ? 1 : 0,
      childrenAllowed: normalized.childrenAllowed ? 1 : 0,
      rulesNotes: normalized.rulesNotes,
      reviewsEnabled: normalized.reviewsEnabled ? 1 : 0,
      reviewCount: normalized.reviewCount,
      verifiedReviewsOnly: normalized.verifiedReviewsOnly ? 1 : 0,
      similarBoatsEnabled: normalized.similarBoatsEnabled ? 1 : 0,
    };

    if (id) {
      await tx.update(yachts).set({ ...sharedValues, updatedByUserId: userId }).where(eq(yachts.id, id));
    } else {
      const insertResult = await tx.insert(yachts).values({
        ...sharedValues,
        createdByUserId: userId,
        updatedByUserId: userId,
      });
      id = Number(insertResult[0].insertId);
    }

    if (!id) throw new Error("Yacht could not be saved");

    await tx.delete(yachtDetails).where(eq(yachtDetails.yachtId, id));
    await tx.delete(yachtAmenities).where(eq(yachtAmenities.yachtId, id));
    await tx.delete(yachtIncludedServices).where(eq(yachtIncludedServices.yachtId, id));
    await tx.delete(yachtEquipment).where(eq(yachtEquipment.yachtId, id));
    await tx.delete(yachtFeatures).where(eq(yachtFeatures.yachtId, id));
    await tx.delete(yachtCustomFields).where(eq(yachtCustomFields.yachtId, id));
    await tx.delete(yachtPricingTiers).where(eq(yachtPricingTiers.yachtId, id));
    await tx.delete(yachtExtraFees).where(eq(yachtExtraFees.yachtId, id));
    await tx.delete(yachtPhotos).where(eq(yachtPhotos.yachtId, id));

    if (normalized.details.length) {
      await tx.insert(yachtDetails).values(normalized.details.map((content, index) => ({ yachtId: id, content, sortOrder: index })));
    }
    if (normalized.amenities.length) {
      await tx.insert(yachtAmenities).values(normalized.amenities.map((label, index) => ({ yachtId: id, label, sortOrder: index })));
    }
    if (normalized.includedServices.length) {
      await tx.insert(yachtIncludedServices).values(normalized.includedServices.map((label, index) => ({ yachtId: id, label, sortOrder: index })));
    }
    if (normalized.equipment.length) {
      await tx.insert(yachtEquipment).values(normalized.equipment.map((label, index) => ({ yachtId: id, label, sortOrder: index })));
    }
    if (normalized.features.length) {
      await tx.insert(yachtFeatures).values(normalized.features.map((item, index) => ({ yachtId: id, featureKey: item.key, featureValue: item.value, sortOrder: index })));
    }
    if (normalized.customFields.length) {
      await tx.insert(yachtCustomFields).values(normalized.customFields.map((item, index) => ({ yachtId: id, fieldKey: item.key, fieldValue: item.value, sortOrder: index })));
    }
    if (normalized.pricingTiers.length) {
      await tx.insert(yachtPricingTiers).values(normalized.pricingTiers.map((item, index) => ({
        yachtId: id,
        seasonLabel: item.seasonLabel,
        minHours: item.minHours,
        minGuests: item.minGuests,
        maxGuests: item.maxGuests,
        price: item.price!,
        currency: item.currency,
        notes: item.notes,
        sortOrder: index,
      })));
    }
    if (normalized.extraFees.length) {
      await tx.insert(yachtExtraFees).values(normalized.extraFees.map((item, index) => ({
        yachtId: id,
        feeType: item.feeType,
        label: item.label,
        pricingModel: item.pricingModel,
        amount: item.amount,
        currency: item.currency,
        unitLabel: item.unitLabel,
        notes: item.notes,
        sortOrder: index,
      })));
    }
    if (normalized.photos.length) {
      await tx.insert(yachtPhotos).values(normalized.photos.map((photo, index) => ({
        yachtId: id,
        url: photo.url,
        storageKey: photo.storageKey,
        isCover: photo.isCover ? 1 : 0,
        sortOrder: index,
      })));
    }

    return id;
  });

  return getAdminYacht(yachtId);
}

export async function listPublishedYachts() {
  const db = await getDb();
  if (!db) return [];

  const rows = await db.select().from(yachts).where(eq(yachts.status, "published")).orderBy(asc(yachts.name));
  const withRelations = await Promise.all(rows.map(async (row) => ({ ...mapYachtBase(row), ...(await loadYachtRelations(row.id)) })));
  return withRelations as YachtRecord[];
}

export async function getPublishedYachtBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const row = (await db.select().from(yachts).where(eq(yachts.slug, slug)).limit(1))[0];
  if (!row || row.status !== "published") return null;

  return { ...mapYachtBase(row), ...(await loadYachtRelations(row.id)) } as YachtRecord;
}
