import mysql from "mysql2/promise";
import { getAdminYacht, saveYacht } from "../server/db";

async function main() {
  const suffix = Date.now();
  const createdBy = 1;
  const tempName = `Schema Check ${suffix}`;

  const payload = {
    name: tempName,
    type: "Catamaran",
    status: "draft" as const,
    guestCapacity: 10,
    price: 4500,
    description: "Temporary yacht used to validate Barcelona-style field persistence.",
    marinaName: "Port Olímpic",
    city: "Barcelona",
    country: "Spain",
    berthLocationText: "Dock B, near the marina office",
    latitude: "41.3851",
    longitude: "2.1734",
    rentalType: "with crew",
    captainIncluded: true,
    crewIncluded: true,
    minimumOrderHours: 4,
    minimumOrderUnit: "hours",
    lengthValue: "23.80",
    lengthUnit: "m",
    beamValue: "11.10",
    beamUnit: "m",
    draftValue: "1.90",
    draftUnit: "m",
    yearBuilt: 2022,
    modelName: "Ocean Voyager 78",
    boatCategory: "Luxury catamaran",
    internalReferenceId: `CHECK-${suffix}`,
    toiletsCount: 4,
    engineSpec: "2 x 225 hp",
    cruisingSpeedValue: "18",
    cruisingSpeedUnit: "knots",
    currency: "EUR",
    pricingMode: "tiered" as const,
    basePriceLabel: "from €4,500",
    vatIncluded: false,
    vatRate: "21",
    pricingNotes: "Fuel billed separately.",
    heroBadge: "WITH CAPTAIN (INCLUDED)",
    shortLocationLabel: "Barcelona waterfront",
    ctaPrimaryLabel: "Request to book",
    ctaSecondaryLabel: "Ask a question",
    bookingHelpText: "Temporary data for persistence verification.",
    extraServiceNotes: "Bar service available on request.",
    serviceStaffRatioText: "Recommended one waiter per 10 guests.",
    smokingAllowed: false,
    petsAllowed: false,
    partyAllowed: true,
    childrenAllowed: true,
    rulesNotes: "Passport details required before departure.",
    reviewsEnabled: true,
    reviewCount: 12,
    verifiedReviewsOnly: true,
    similarBoatsEnabled: true,
    details: ["Sunset charter available.", "Ideal for events and private cruises."],
    amenities: ["Wi-Fi", "Paddle boards"],
    includedServices: ["Captain", "Welcome drinks"],
    equipment: ["Tender", "Snorkelling gear"],
    features: [{ key: "Cabins", value: "4" }],
    customFields: [{ key: "Best for", value: "Corporate events" }],
    pricingTiers: [
      { seasonLabel: "High season", minHours: 4, minGuests: 1, maxGuests: 10, price: 4500, currency: "EUR", notes: "Morning departure" },
    ],
    extraFees: [
      { feeType: "Mandatory", label: "Cleaning fee", pricingModel: "per booking", amount: 180, currency: "EUR", unitLabel: "booking", notes: "Paid at embarkation" },
    ],
    photos: [],
  };

  const created = await saveYacht(payload, createdBy);
  const loaded = await getAdminYacht(created.id);

  if (!loaded) {
    throw new Error("Saved yacht could not be read back");
  }

  const checks = {
    city: loaded.city,
    pricingMode: loaded.pricingMode,
    includedServices: loaded.includedServices.map((item) => item.label),
    equipment: loaded.equipment.map((item) => item.label),
    pricingTiers: loaded.pricingTiers.map((item) => item.seasonLabel),
    extraFees: loaded.extraFees.map((item) => item.label),
  };

  console.log(JSON.stringify({ created, checks }, null, 2));

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  await connection.query("DELETE FROM yacht_equipment WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_extra_fees WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_included_services WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_pricing_tiers WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_amenities WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_details WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_features WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_custom_fields WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yacht_photos WHERE yachtId = ?", [created.id]);
  await connection.query("DELETE FROM yachts WHERE id = ?", [created.id]);
  await connection.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
