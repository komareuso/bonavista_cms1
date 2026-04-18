import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, MapPin, ShieldCheck, Star } from "lucide-react";
import { useRoute } from "wouter";

export default function Experience() {
  const [, params] = useRoute("/experience/:slug");
  const slug = params?.slug ?? "";
  const yacht = trpc.yachts.publicBySlug.useQuery(
    { slug },
    { enabled: slug.length > 0 },
  );

  if (yacht.isLoading) {
    return <Shell><p className="rounded-3xl border bg-white p-8 text-sm text-slate-500">Loading yacht...</p></Shell>;
  }

  if (!yacht.data) {
    return (
      <Shell>
        <div className="rounded-3xl border bg-white p-10 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Yacht not found</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            This yacht is not published or does not exist in the Bonavista catalog.
          </p>
          <a href="/"><Button className="mt-6">Back to catalog</Button></a>
        </div>
      </Shell>
    );
  }

  const data = yacht.data;
  const cover = data.photos.find((photo) => photo.isCover) ?? data.photos[0] ?? null;
  const locationLabel = [data.marinaName, data.city, data.country].filter(Boolean).join(", ");
  const pricingHeadline = data.basePriceLabel || (data.price ? `${data.currency ?? "EUR"} ${data.price.toLocaleString()}` : "Price on request");

  return (
    <Shell>
      <div className="space-y-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-900">
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </a>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {cover ? (
              <img src={cover.url} alt={data.name} className="h-[460px] w-full rounded-[2rem] object-cover shadow-xl" />
            ) : (
              <div className="flex h-[460px] items-center justify-center rounded-[2rem] bg-slate-200 text-slate-500">No cover image</div>
            )}
            {data.photos.length > 1 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.photos.map((photo) => (
                  <img key={photo.id} src={photo.url} alt={data.name} className="h-40 w-full rounded-3xl object-cover" />
                ))}
              </div>
            ) : null}
          </div>

          <div className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-700">Bonavista fleet</p>
              {data.heroBadge ? <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">{data.heroBadge}</span> : null}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">{data.name}</h1>
            <p className="mt-3 text-base text-slate-500">{data.modelName || data.type}</p>

            {locationLabel ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                <MapPin className="h-4 w-4 text-sky-700" />
                {data.shortLocationLabel || locationLabel}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 rounded-3xl bg-slate-50 p-5 sm:grid-cols-2">
              <Fact label="Price" value={pricingHeadline} />
              <Fact label="Guests" value={data.guestCapacity ? String(data.guestCapacity) : "On request"} />
              <Fact label="Rental type" value={data.rentalType || "On request"} />
              <Fact label="Minimum charter" value={data.minimumOrderHours ? `${data.minimumOrderHours} ${data.minimumOrderUnit || "hours"}` : "On request"} />
            </div>

            <p className="mt-6 text-sm leading-8 text-slate-700">{data.description}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button>{data.ctaPrimaryLabel || "Request to book"}</Button>
              <Button variant="outline">{data.ctaSecondaryLabel || "Contact us"}</Button>
            </div>

            {data.bookingHelpText ? (
              <div className="mt-6 rounded-3xl border border-sky-100 bg-sky-50 p-5 text-sm leading-7 text-sky-900">
                {data.bookingHelpText}
              </div>
            ) : null}

            {(data.reviewsEnabled || data.reviewCount) ? (
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-amber-700">
                  <Star className="h-4 w-4" />
                  {data.reviewCount ? `${data.reviewCount}+ reviews` : "Reviews available"}
                </div>
                {data.verifiedReviewsOnly ? (
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Verified reviews only
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Overview</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <Fact label="Model" value={data.modelName || "On request"} />
              <Fact label="Category" value={data.boatCategory || data.type} />
              <Fact label="Year built" value={data.yearBuilt ? String(data.yearBuilt) : "On request"} />
              <Fact label="Length" value={formatMeasure(data.lengthValue, data.lengthUnit)} />
              <Fact label="Beam" value={formatMeasure(data.beamValue, data.beamUnit)} />
              <Fact label="Draft" value={formatMeasure(data.draftValue, data.draftUnit)} />
              <Fact label="Toilets" value={data.toiletsCount ? String(data.toiletsCount) : "On request"} />
              <Fact label="Engine" value={data.engineSpec || "On request"} />
              <Fact label="Cruising speed" value={formatMeasure(data.cruisingSpeedValue, data.cruisingSpeedUnit)} />
            </div>
            {data.berthLocationText ? (
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                <p className="font-semibold text-slate-950">Berth location</p>
                <p className="mt-2">{data.berthLocationText}</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Pricing summary</h2>
            <div className="mt-6 space-y-4">
              <PriceRow label="Headline price" value={pricingHeadline} />
              <PriceRow label="Currency" value={data.currency || "EUR"} />
              <PriceRow label="VAT" value={data.vatIncluded ? (data.vatRate ? `Included (${data.vatRate}%)` : "Included") : (data.vatRate ? `Not included (${data.vatRate}%)` : "Not included") } />
              <PriceRow label="Pricing mode" value={data.pricingMode === "tiered" ? "Tiered pricing" : "Fixed price"} />
            </div>
            {data.pricingNotes ? (
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-700">{data.pricingNotes}</div>
            ) : null}
          </section>
        </div>

        {data.pricingTiers.length ? (
          <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Pricing tiers</h2>
            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Season / package</th>
                    <th className="px-4 py-3 font-medium">Hours</th>
                    <th className="px-4 py-3 font-medium">Guests</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.pricingTiers.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100 text-slate-700">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-950">{item.seasonLabel}</p>
                        {item.notes ? <p className="mt-1 text-xs text-slate-500">{item.notes}</p> : null}
                      </td>
                      <td className="px-4 py-4">{item.minHours ? `${item.minHours}+ h` : "—"}</td>
                      <td className="px-4 py-4">{formatGuestRange(item.minGuests, item.maxGuests)}</td>
                      <td className="px-4 py-4 font-semibold text-slate-950">{item.currency} {item.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-2">
          {data.includedServices.length ? (
            <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Included services</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {data.includedServices.map((item) => (
                  <span key={item.id} className="rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{item.label}</span>
                ))}
              </div>
              {data.serviceStaffRatioText ? <p className="mt-6 text-sm leading-7 text-slate-600">{data.serviceStaffRatioText}</p> : null}
            </section>
          ) : null}

          {data.equipment.length ? (
            <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Equipment on board</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {data.equipment.map((item) => (
                  <span key={item.id} className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">{item.label}</span>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        {data.extraFees.length ? (
          <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Extra fees</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {data.extraFees.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{item.feeType || "Extra"}</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">{item.label}</h3>
                    </div>
                    <p className="text-base font-semibold text-slate-950">
                      {item.amount ? `${item.currency || data.currency || "EUR"} ${item.amount.toLocaleString()}` : "On request"}
                      {item.unitLabel ? ` / ${item.unitLabel}` : ""}
                    </p>
                  </div>
                  {item.pricingModel ? <p className="mt-3 text-sm text-slate-600">Pricing model: {item.pricingModel}</p> : null}
                  {item.notes ? <p className="mt-2 text-sm leading-7 text-slate-600">{item.notes}</p> : null}
                </div>
              ))}
            </div>
            {data.extraServiceNotes ? <p className="mt-6 text-sm leading-7 text-slate-600">{data.extraServiceNotes}</p> : null}
          </section>
        ) : null}

        {(data.rulesNotes || hasRuleBadges(data)) ? (
          <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Rules and conditions</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <RuleBadge label="Smoking" allowed={data.smokingAllowed} />
              <RuleBadge label="Pets" allowed={data.petsAllowed} />
              <RuleBadge label="Parties" allowed={data.partyAllowed} />
              <RuleBadge label="Children" allowed={data.childrenAllowed} />
            </div>
            {data.rulesNotes ? <p className="mt-6 text-sm leading-7 text-slate-600">{data.rulesNotes}</p> : null}
          </section>
        ) : null}

        {data.details.length ? (
          <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Experience details</h2>
            <div className="mt-6 space-y-5 text-sm leading-8 text-slate-700">
              {data.details.map((item) => (
                <p key={item.id}>{item.content}</p>
              ))}
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          {data.features.length ? (
            <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Key features</h2>
              <div className="mt-6 space-y-3">
                {data.features.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
                    <span className="font-medium text-slate-500">{item.key}</span>
                    <span className="text-right text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {data.customFields.length ? (
            <section className="rounded-[2rem] border bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Custom information</h2>
              <div className="mt-6 space-y-3">
                {data.customFields.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
                    <span className="font-medium text-slate-500">{item.key}</span>
                    <span className="text-right text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container py-10">{children}</div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="text-right font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function RuleBadge({ label, allowed }: { label: string; allowed: boolean }) {
  return (
    <span className={`rounded-full px-4 py-2 text-sm ${allowed ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>
      {label}: {allowed ? "Allowed" : "Not allowed"}
    </span>
  );
}

function formatMeasure(value: string | null, unit: string | null) {
  if (!value) return "On request";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

function formatGuestRange(minGuests: number | null, maxGuests: number | null) {
  if (minGuests && maxGuests) return `${minGuests}–${maxGuests}`;
  if (minGuests) return `${minGuests}+`;
  if (maxGuests) return `up to ${maxGuests}`;
  return "—";
}

function hasRuleBadges(data: { smokingAllowed: boolean; petsAllowed: boolean; partyAllowed: boolean; childrenAllowed: boolean }) {
  return data.smokingAllowed || data.petsAllowed || data.partyAllowed || data.childrenAllowed;
}
