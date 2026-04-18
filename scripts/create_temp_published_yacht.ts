import { writeFileSync } from "node:fs";
import { saveYacht } from "../server/db";

async function main() {
  const suffix = Date.now();
  const payload = {
    name: `Published Schema Check ${suffix}`,
    type: "Catamaran",
    status: "published" as const,
    guestCapacity: 12,
    price: 6200,
    description: "Temporary published yacht used to validate public Barcelona-style rendering.",
    marinaName: "Port Olímpic",
    city: "Barcelona",
    country: "Spain",
    berthLocationText: "Dock C, marina entrance",
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
    internalReferenceId: `PUB-CHECK-${suffix}`,
    toiletsCount: 4,
    engineSpec: "2 x 225 hp",
    cruisingSpeedValue: "18",
    cruisingSpeedUnit: "knots",
    currency: "EUR",
    pricingMode: "tiered" as const,
    basePriceLabel: "from €6,200",
    vatIncluded: false,
    vatRate: "21",
    pricingNotes: "Fuel billed separately.",
    heroBadge: "WITH CAPTAIN (INCLUDED)",
    shortLocationLabel: "Barcelona waterfront",
    ctaPrimaryLabel: "Request to book",
    ctaSecondaryLabel: "Contact us",
    bookingHelpText: "Temporary published entry for public rendering validation.",
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
      { seasonLabel: "High season", minHours: 4, minGuests: 1, maxGuests: 12, price: 6200, currency: "EUR", notes: "Morning departure" },
    ],
    extraFees: [
      { feeType: "Mandatory", label: "Cleaning fee", pricingModel: "per booking", amount: 180, currency: "EUR", unitLabel: "booking", notes: "Paid at embarkation" },
    ],
    photos: [],
  };

  const created = await saveYacht(payload, 1);
  writeFileSync(
    "/home/ubuntu/bonavista_cms/scripts/temp_published_yacht.json",
    JSON.stringify({ id: created.id, slug: created.slug }, null, 2),
  );
  console.log(JSON.stringify({ id: created.id, slug: created.slug }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
