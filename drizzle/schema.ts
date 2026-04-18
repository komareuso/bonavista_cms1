import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const yachts = mysqlTable("yachts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  guestCapacity: int("guestCapacity"),
  price: int("price"),
  description: text("description").notNull(),
  coverPhotoUrl: text("coverPhotoUrl"),
  coverPhotoKey: varchar("coverPhotoKey", { length: 255 }),
  marinaName: varchar("marinaName", { length: 255 }),
  city: varchar("city", { length: 120 }),
  country: varchar("country", { length: 120 }),
  berthLocationText: text("berthLocationText"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  rentalType: varchar("rentalType", { length: 120 }),
  captainIncluded: int("captainIncluded").default(0).notNull(),
  crewIncluded: int("crewIncluded").default(0).notNull(),
  minimumOrderHours: int("minimumOrderHours"),
  minimumOrderUnit: varchar("minimumOrderUnit", { length: 24 }).default("hours"),
  lengthValue: decimal("lengthValue", { precision: 8, scale: 2 }),
  lengthUnit: varchar("lengthUnit", { length: 16 }),
  beamValue: decimal("beamValue", { precision: 8, scale: 2 }),
  beamUnit: varchar("beamUnit", { length: 16 }),
  draftValue: decimal("draftValue", { precision: 8, scale: 2 }),
  draftUnit: varchar("draftUnit", { length: 16 }),
  yearBuilt: int("yearBuilt"),
  modelName: varchar("modelName", { length: 160 }),
  boatCategory: varchar("boatCategory", { length: 160 }),
  internalReferenceId: varchar("internalReferenceId", { length: 80 }),
  toiletsCount: int("toiletsCount"),
  engineSpec: varchar("engineSpec", { length: 160 }),
  cruisingSpeedValue: decimal("cruisingSpeedValue", { precision: 8, scale: 2 }),
  cruisingSpeedUnit: varchar("cruisingSpeedUnit", { length: 16 }),
  currency: varchar("currency", { length: 8 }).default("EUR"),
  pricingMode: mysqlEnum("pricingMode", ["fixed", "tiered"]).default("fixed").notNull(),
  basePriceLabel: varchar("basePriceLabel", { length: 160 }),
  vatIncluded: int("vatIncluded").default(0).notNull(),
  vatRate: decimal("vatRate", { precision: 5, scale: 2 }),
  pricingNotes: text("pricingNotes"),
  heroBadge: varchar("heroBadge", { length: 160 }),
  shortLocationLabel: varchar("shortLocationLabel", { length: 255 }),
  ctaPrimaryLabel: varchar("ctaPrimaryLabel", { length: 120 }),
  ctaSecondaryLabel: varchar("ctaSecondaryLabel", { length: 120 }),
  bookingHelpText: text("bookingHelpText"),
  extraServiceNotes: text("extraServiceNotes"),
  serviceStaffRatioText: text("serviceStaffRatioText"),
  smokingAllowed: int("smokingAllowed"),
  petsAllowed: int("petsAllowed"),
  partyAllowed: int("partyAllowed"),
  childrenAllowed: int("childrenAllowed"),
  rulesNotes: text("rulesNotes"),
  reviewsEnabled: int("reviewsEnabled").default(0).notNull(),
  reviewCount: int("reviewCount"),
  verifiedReviewsOnly: int("verifiedReviewsOnly").default(0).notNull(),
  similarBoatsEnabled: int("similarBoatsEnabled").default(0).notNull(),
  createdByUserId: int("createdByUserId"),
  updatedByUserId: int("updatedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const yachtDetails = mysqlTable("yacht_details", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  content: text("content").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtAmenities = mysqlTable("yacht_amenities", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtFeatures = mysqlTable("yacht_features", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  featureKey: varchar("featureKey", { length: 255 }).notNull(),
  featureValue: text("featureValue").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtCustomFields = mysqlTable("yacht_custom_fields", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  fieldKey: varchar("fieldKey", { length: 255 }).notNull(),
  fieldValue: text("fieldValue").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtPhotos = mysqlTable("yacht_photos", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  url: text("url").notNull(),
  storageKey: varchar("storageKey", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isCover: int("isCover").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtIncludedServices = mysqlTable("yacht_included_services", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtEquipment = mysqlTable("yacht_equipment", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtPricingTiers = mysqlTable("yacht_pricing_tiers", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  seasonLabel: varchar("seasonLabel", { length: 160 }).notNull(),
  minHours: int("minHours"),
  minGuests: int("minGuests"),
  maxGuests: int("maxGuests"),
  price: int("price").notNull(),
  currency: varchar("currency", { length: 8 }).default("EUR").notNull(),
  notes: text("notes"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const yachtExtraFees = mysqlTable("yacht_extra_fees", {
  id: int("id").autoincrement().primaryKey(),
  yachtId: int("yachtId").notNull(),
  feeType: varchar("feeType", { length: 80 }),
  label: varchar("label", { length: 255 }).notNull(),
  pricingModel: varchar("pricingModel", { length: 80 }),
  amount: int("amount"),
  currency: varchar("currency", { length: 8 }).default("EUR"),
  unitLabel: varchar("unitLabel", { length: 80 }),
  notes: text("notes"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Yacht = typeof yachts.$inferSelect;
export type InsertYacht = typeof yachts.$inferInsert;
export type YachtDetail = typeof yachtDetails.$inferSelect;
export type InsertYachtDetail = typeof yachtDetails.$inferInsert;
export type YachtAmenity = typeof yachtAmenities.$inferSelect;
export type InsertYachtAmenity = typeof yachtAmenities.$inferInsert;
export type YachtFeature = typeof yachtFeatures.$inferSelect;
export type InsertYachtFeature = typeof yachtFeatures.$inferInsert;
export type YachtCustomField = typeof yachtCustomFields.$inferSelect;
export type InsertYachtCustomField = typeof yachtCustomFields.$inferInsert;
export type YachtPhoto = typeof yachtPhotos.$inferSelect;
export type InsertYachtPhoto = typeof yachtPhotos.$inferInsert;
export type YachtIncludedService = typeof yachtIncludedServices.$inferSelect;
export type InsertYachtIncludedService = typeof yachtIncludedServices.$inferInsert;
export type YachtEquipmentItem = typeof yachtEquipment.$inferSelect;
export type InsertYachtEquipmentItem = typeof yachtEquipment.$inferInsert;
export type YachtPricingTier = typeof yachtPricingTiers.$inferSelect;
export type InsertYachtPricingTier = typeof yachtPricingTiers.$inferInsert;
export type YachtExtraFee = typeof yachtExtraFees.$inferSelect;
export type InsertYachtExtraFee = typeof yachtExtraFees.$inferInsert;
