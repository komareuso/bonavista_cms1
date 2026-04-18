import { describe, expect, it } from "vitest";
import { yachtEditorSchema } from "./routers";

describe("yachtEditorSchema", () => {
  it("accepts the expanded Barcelona-style yacht payload", () => {
    const parsed = yachtEditorSchema.parse({
      name: "Ocean Voyager 78",
      type: "Catamaran",
      status: "published",
      guestCapacity: 18,
      price: 2400,
      description: "Luxury charter catamaran in Barcelona.",
      marinaName: "Port Olímpic",
      city: "Barcelona",
      country: "Spain",
      berthLocationText: "Mooring available near Port Olímpic entrance",
      latitude: "41.3851",
      longitude: "2.1734",
      rentalType: "with crew",
      captainIncluded: true,
      crewIncluded: true,
      minimumOrderHours: 4,
      minimumOrderUnit: "hours",
      lengthValue: "23.8",
      lengthUnit: "m",
      beamValue: "11.1",
      beamUnit: "m",
      draftValue: "1.9",
      draftUnit: "m",
      yearBuilt: 2022,
      modelName: "Ocean Voyager 78",
      boatCategory: "Luxury catamaran",
      internalReferenceId: "OV78-BCN",
      toiletsCount: 4,
      engineSpec: "2 x 225 hp",
      cruisingSpeedValue: "18",
      cruisingSpeedUnit: "knots",
      currency: "EUR",
      pricingMode: "tiered",
      basePriceLabel: "from €2,400",
      vatIncluded: false,
      vatRate: "21",
      pricingNotes: "Fuel and dock fees charged separately.",
      heroBadge: "WITH CAPTAIN (INCLUDED)",
      shortLocationLabel: "Barcelona waterfront",
      ctaPrimaryLabel: "Request to book",
      ctaSecondaryLabel: "Ask a question",
      bookingHelpText: "Our team confirms final pricing after route selection.",
      extraServiceNotes: "Bar packages and DJ service are optional.",
      serviceStaffRatioText: "Recommended one waiter per 12 guests.",
      smokingAllowed: false,
      petsAllowed: false,
      partyAllowed: true,
      childrenAllowed: true,
      rulesNotes: "Passport details required before embarkation.",
      reviewsEnabled: true,
      reviewCount: 36,
      verifiedReviewsOnly: true,
      similarBoatsEnabled: true,
      details: ["Sunset charters available daily."],
      amenities: ["Bluetooth audio", "Paddle boards"],
      includedServices: ["Captain", "Welcome drinks"],
      equipment: ["Snorkelling gear", "Tender"],
      features: [{ key: "Cabins", value: "4" }],
      customFields: [{ key: "Best for", value: "Corporate events" }],
      pricingTiers: [
        {
          seasonLabel: "High season",
          minHours: 4,
          minGuests: 1,
          maxGuests: 12,
          price: 3200,
          currency: "EUR",
          notes: "Morning or sunset slot",
        },
      ],
      extraFees: [
        {
          feeType: "Mandatory",
          label: "Cleaning fee",
          pricingModel: "per booking",
          amount: 180,
          currency: "EUR",
          unitLabel: "booking",
          notes: "Paid on embarkation day",
        },
      ],
      photos: [
        {
          url: "https://cdn.example.com/yacht.jpg",
          storageKey: "bonavista/yachts/sample.jpg",
          isCover: true,
        },
      ],
    });

    expect(parsed.pricingMode).toBe("tiered");
    expect(parsed.pricingTiers[0]?.seasonLabel).toBe("High season");
    expect(parsed.extraFees[0]?.label).toBe("Cleaning fee");
    expect(parsed.includedServices).toContain("Captain");
  });

  it("rejects negative numeric values in new structured pricing fields", () => {
    expect(() =>
      yachtEditorSchema.parse({
        name: "Broken yacht",
        type: "Catamaran",
        status: "draft",
        guestCapacity: 10,
        price: 1000,
        description: "Invalid payload",
        minimumOrderHours: null,
        yearBuilt: null,
        toiletsCount: null,
        reviewCount: null,
        pricingTiers: [
          {
            seasonLabel: "Invalid tier",
            minHours: -2,
            minGuests: null,
            maxGuests: null,
            price: 100,
            currency: "EUR",
            notes: "",
          },
        ],
        extraFees: [],
        details: [],
        amenities: [],
        includedServices: [],
        equipment: [],
        features: [],
        customFields: [],
        photos: [],
      }),
    ).toThrow();
  });
});
