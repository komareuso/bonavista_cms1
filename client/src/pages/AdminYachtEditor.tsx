import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowDown, ArrowUp, ImagePlus, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { ChangeEvent, Dispatch, ReactNode, SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

type Pair = { key: string; value: string };
type Photo = { id?: number; url: string; storageKey: string; isCover: boolean };
type PricingTier = {
  seasonLabel: string;
  minHours: string;
  minGuests: string;
  maxGuests: string;
  price: string;
  currency: string;
  notes: string;
};
type ExtraFee = {
  feeType: string;
  label: string;
  pricingModel: string;
  amount: string;
  currency: string;
  unitLabel: string;
  notes: string;
};

type YachtFormState = {
  name: string;
  type: string;
  status: "draft" | "published";
  guestCapacity: string;
  price: string;
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
  minimumOrderHours: string;
  minimumOrderUnit: string;
  lengthValue: string;
  lengthUnit: string;
  beamValue: string;
  beamUnit: string;
  draftValue: string;
  draftUnit: string;
  yearBuilt: string;
  modelName: string;
  boatCategory: string;
  internalReferenceId: string;
  toiletsCount: string;
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
  reviewCount: string;
  verifiedReviewsOnly: boolean;
  similarBoatsEnabled: boolean;
  details: string[];
  amenities: string[];
  includedServices: string[];
  equipment: string[];
  features: Pair[];
  customFields: Pair[];
  pricingTiers: PricingTier[];
  extraFees: ExtraFee[];
  photos: Photo[];
};

const emptyState: YachtFormState = {
  name: "",
  type: "",
  status: "draft",
  guestCapacity: "",
  price: "",
  description: "",
  marinaName: "",
  city: "",
  country: "",
  berthLocationText: "",
  latitude: "",
  longitude: "",
  rentalType: "",
  captainIncluded: false,
  crewIncluded: false,
  minimumOrderHours: "",
  minimumOrderUnit: "hours",
  lengthValue: "",
  lengthUnit: "m",
  beamValue: "",
  beamUnit: "m",
  draftValue: "",
  draftUnit: "m",
  yearBuilt: "",
  modelName: "",
  boatCategory: "",
  internalReferenceId: "",
  toiletsCount: "",
  engineSpec: "",
  cruisingSpeedValue: "",
  cruisingSpeedUnit: "knots",
  currency: "EUR",
  pricingMode: "fixed",
  basePriceLabel: "",
  vatIncluded: false,
  vatRate: "",
  pricingNotes: "",
  heroBadge: "",
  shortLocationLabel: "",
  ctaPrimaryLabel: "Request to book",
  ctaSecondaryLabel: "Contact us",
  bookingHelpText: "",
  extraServiceNotes: "",
  serviceStaffRatioText: "",
  smokingAllowed: false,
  petsAllowed: false,
  partyAllowed: false,
  childrenAllowed: false,
  rulesNotes: "",
  reviewsEnabled: false,
  reviewCount: "",
  verifiedReviewsOnly: false,
  similarBoatsEnabled: false,
  details: [""],
  amenities: [""],
  includedServices: [""],
  equipment: [""],
  features: [{ key: "", value: "" }],
  customFields: [{ key: "", value: "" }],
  pricingTiers: [{ seasonLabel: "", minHours: "", minGuests: "", maxGuests: "", price: "", currency: "EUR", notes: "" }],
  extraFees: [{ feeType: "", label: "", pricingModel: "", amount: "", currency: "EUR", unitLabel: "", notes: "" }],
  photos: [],
};

export default function AdminYachtEditor() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/cms/yachts/:id");
  const rawYachtId = match ? params.id : null;
  const yachtId = rawYachtId && rawYachtId !== "new" ? Number(rawYachtId) : null;
  const isEditingExisting = typeof yachtId === "number" && Number.isFinite(yachtId);
  const utils = trpc.useUtils();
  const editorQuery = trpc.yachts.getEditor.useQuery(
    { id: yachtId ?? 0 },
    { enabled: !!user && user.role === "admin" && isEditingExisting },
  );
  const [form, setForm] = useState<YachtFormState>(emptyState);
  const [persistedYachtId, setPersistedYachtId] = useState<number | null>(yachtId);
  const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved" | "error">("idle");
  const lastPersistedSignatureRef = useRef(JSON.stringify(buildSavePayload(emptyState, yachtId ?? undefined)));
  const emptyDraftSignature = useMemo(() => JSON.stringify(buildSavePayload(emptyState, undefined)), []);
  const savePayload = useMemo(() => buildSavePayload(form, persistedYachtId ?? undefined), [form, persistedYachtId]);
  const saveSignature = useMemo(() => JSON.stringify(savePayload), [savePayload]);
  const hasDraftContent = saveSignature !== emptyDraftSignature;

  const persistSavedResult = async (result: { id: number; slug: string }) => {
    await Promise.all([
      utils.yachts.adminList.invalidate(),
      utils.yachts.dashboard.invalidate(),
      utils.yachts.publicList.invalidate(),
      utils.yachts.getEditor.invalidate({ id: result.id }),
    ]);
    if (result?.slug) {
      await utils.yachts.publicBySlug.invalidate({ slug: result.slug });
    }
    setPersistedYachtId(result.id);
    lastPersistedSignatureRef.current = JSON.stringify(buildSavePayload(form, result.id));
    setSaveState("saved");
    if (!isEditingExisting) {
      setLocation(`/cms/yachts/${result.id}`);
    }
  };

  const saveMutation = trpc.yachts.save.useMutation({
    onSuccess: async (result) => {
      if (!result) {
        setSaveState("error");
        toast.error("Yacht save returned an empty response");
        return;
      }
      await persistSavedResult(result);
      toast.success("Yacht saved successfully");
    },
    onError: (error) => {
      setSaveState("error");
      toast.error(error.message);
    },
  });
  const autosaveMutation = trpc.yachts.save.useMutation({
    onSuccess: async (result) => {
      if (!result) {
        setSaveState("error");
        return;
      }
      await persistSavedResult(result);
    },
    onError: (error) => {
      setSaveState("error");
      toast.error(`Draft autosave failed: ${error.message}`);
    },
  });
  const uploadMutation = trpc.yachts.uploadPhoto.useMutation({
    onError: (error) => toast.error(error.message),
  });

  const isBusy = saveMutation.isPending || autosaveMutation.isPending || uploadMutation.isPending;

  useEffect(() => {
    if (!editorQuery.data) return;
    const hydratedForm: YachtFormState = {
      name: editorQuery.data.name,
      type: editorQuery.data.type,
      status: editorQuery.data.status,
      guestCapacity: editorQuery.data.guestCapacity?.toString() ?? "",
      price: editorQuery.data.price?.toString() ?? "",
      description: editorQuery.data.description,
      marinaName: editorQuery.data.marinaName ?? "",
      city: editorQuery.data.city ?? "",
      country: editorQuery.data.country ?? "",
      berthLocationText: editorQuery.data.berthLocationText ?? "",
      latitude: editorQuery.data.latitude ?? "",
      longitude: editorQuery.data.longitude ?? "",
      rentalType: editorQuery.data.rentalType ?? "",
      captainIncluded: editorQuery.data.captainIncluded,
      crewIncluded: editorQuery.data.crewIncluded,
      minimumOrderHours: editorQuery.data.minimumOrderHours?.toString() ?? "",
      minimumOrderUnit: editorQuery.data.minimumOrderUnit ?? "hours",
      lengthValue: editorQuery.data.lengthValue ?? "",
      lengthUnit: editorQuery.data.lengthUnit ?? "m",
      beamValue: editorQuery.data.beamValue ?? "",
      beamUnit: editorQuery.data.beamUnit ?? "m",
      draftValue: editorQuery.data.draftValue ?? "",
      draftUnit: editorQuery.data.draftUnit ?? "m",
      yearBuilt: editorQuery.data.yearBuilt?.toString() ?? "",
      modelName: editorQuery.data.modelName ?? "",
      boatCategory: editorQuery.data.boatCategory ?? "",
      internalReferenceId: editorQuery.data.internalReferenceId ?? "",
      toiletsCount: editorQuery.data.toiletsCount?.toString() ?? "",
      engineSpec: editorQuery.data.engineSpec ?? "",
      cruisingSpeedValue: editorQuery.data.cruisingSpeedValue ?? "",
      cruisingSpeedUnit: editorQuery.data.cruisingSpeedUnit ?? "knots",
      currency: editorQuery.data.currency ?? "EUR",
      pricingMode: editorQuery.data.pricingMode,
      basePriceLabel: editorQuery.data.basePriceLabel ?? "",
      vatIncluded: editorQuery.data.vatIncluded,
      vatRate: editorQuery.data.vatRate ?? "",
      pricingNotes: editorQuery.data.pricingNotes ?? "",
      heroBadge: editorQuery.data.heroBadge ?? "",
      shortLocationLabel: editorQuery.data.shortLocationLabel ?? "",
      ctaPrimaryLabel: editorQuery.data.ctaPrimaryLabel ?? "Request to book",
      ctaSecondaryLabel: editorQuery.data.ctaSecondaryLabel ?? "Contact us",
      bookingHelpText: editorQuery.data.bookingHelpText ?? "",
      extraServiceNotes: editorQuery.data.extraServiceNotes ?? "",
      serviceStaffRatioText: editorQuery.data.serviceStaffRatioText ?? "",
      smokingAllowed: editorQuery.data.smokingAllowed,
      petsAllowed: editorQuery.data.petsAllowed,
      partyAllowed: editorQuery.data.partyAllowed,
      childrenAllowed: editorQuery.data.childrenAllowed,
      rulesNotes: editorQuery.data.rulesNotes ?? "",
      reviewsEnabled: editorQuery.data.reviewsEnabled,
      reviewCount: editorQuery.data.reviewCount?.toString() ?? "",
      verifiedReviewsOnly: editorQuery.data.verifiedReviewsOnly,
      similarBoatsEnabled: editorQuery.data.similarBoatsEnabled,
      details: editorQuery.data.details.length ? editorQuery.data.details.map((item) => item.content) : [""],
      amenities: editorQuery.data.amenities.length ? editorQuery.data.amenities.map((item) => item.label) : [""],
      includedServices: editorQuery.data.includedServices.length ? editorQuery.data.includedServices.map((item) => item.label) : [""],
      equipment: editorQuery.data.equipment.length ? editorQuery.data.equipment.map((item) => item.label) : [""],
      features: editorQuery.data.features.length ? editorQuery.data.features.map((item) => ({ key: item.key, value: item.value })) : [{ key: "", value: "" }],
      customFields: editorQuery.data.customFields.length ? editorQuery.data.customFields.map((item) => ({ key: item.key, value: item.value })) : [{ key: "", value: "" }],
      pricingTiers: editorQuery.data.pricingTiers.length
        ? editorQuery.data.pricingTiers.map((item) => ({
            seasonLabel: item.seasonLabel,
            minHours: item.minHours?.toString() ?? "",
            minGuests: item.minGuests?.toString() ?? "",
            maxGuests: item.maxGuests?.toString() ?? "",
            price: item.price?.toString() ?? "",
            currency: item.currency ?? "EUR",
            notes: item.notes ?? "",
          }))
        : [{ seasonLabel: "", minHours: "", minGuests: "", maxGuests: "", price: "", currency: "EUR", notes: "" }],
      extraFees: editorQuery.data.extraFees.length
        ? editorQuery.data.extraFees.map((item) => ({
            feeType: item.feeType ?? "",
            label: item.label,
            pricingModel: item.pricingModel ?? "",
            amount: item.amount?.toString() ?? "",
            currency: item.currency ?? "EUR",
            unitLabel: item.unitLabel ?? "",
            notes: item.notes ?? "",
          }))
        : [{ feeType: "", label: "", pricingModel: "", amount: "", currency: "EUR", unitLabel: "", notes: "" }],
      photos: editorQuery.data.photos.length
        ? editorQuery.data.photos.map((item) => ({ id: item.id, url: item.url, storageKey: item.storageKey, isCover: item.isCover }))
        : [],
    };
    setForm(hydratedForm);
    setPersistedYachtId(editorQuery.data.id);
    lastPersistedSignatureRef.current = JSON.stringify(buildSavePayload(hydratedForm, editorQuery.data.id));
    setSaveState("idle");
  }, [editorQuery.data]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    if (saveSignature === lastPersistedSignatureRef.current) {
      setSaveState(hasDraftContent ? "saved" : "idle");
      return;
    }
    setSaveState("dirty");
    if (!hasDraftContent || saveMutation.isPending || uploadMutation.isPending || autosaveMutation.isPending) return;

    const timeoutId = window.setTimeout(() => {
      setSaveState("saving");
      autosaveMutation.mutate(savePayload);
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [user, hasDraftContent, saveSignature, savePayload, saveMutation.isPending, uploadMutation.isPending, autosaveMutation.isPending]);

  const pageTitle = useMemo(() => (isEditingExisting ? "Edit yacht" : "Add new yacht"), [isEditingExisting]);

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    try {
      const uploads = await Promise.all(
        files.map(async (file) => {
          const base64 = await fileToBase64(file);
          const result = await uploadMutation.mutateAsync({
            fileName: file.name,
            mimeType: file.type || "image/jpeg",
            base64,
          });
          return { url: result.url, storageKey: result.key, isCover: false } satisfies Photo;
        }),
      );

      setForm((current) => {
        const nextPhotos = [...current.photos, ...uploads];
        if (nextPhotos.length === 1) nextPhotos[0]!.isCover = true;
        return { ...current, photos: nextPhotos };
      });
      toast.success("Photos uploaded to storage");
    } finally {
      event.target.value = "";
    }
  }

  function handleSave() {
    setSaveState("saving");
    saveMutation.mutate(savePayload);
  }

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-700">Bonavista CMS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{pageTitle}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Manage yacht specifications, Barcelona-style pricing blocks, rental rules, service inclusions, and media stored in S3.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className={`text-sm font-medium ${saveState === "error" ? "text-rose-600" : saveState === "saved" ? "text-emerald-600" : "text-slate-500"}`}>
              {saveState === "saving" ? "Saving draft to database..." : saveState === "saved" ? "All changes saved" : saveState === "dirty" ? "Unsaved changes pending" : saveState === "error" ? "Save failed. Please try again." : "Start editing and your draft will autosave"}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setLocation("/cms/yachts")}>Back to fleet</Button>
              <Button onClick={handleSave} disabled={isBusy}>{saveMutation.isPending || autosaveMutation.isPending ? "Saving..." : "Save yacht"}</Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border bg-white p-8 text-sm text-slate-500">Checking access rights...</div>
        ) : user?.role !== "admin" ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-slate-700">
            <div className="mb-3 flex items-center gap-3 text-amber-900">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Admin access required</h2>
            </div>
            <p className="text-sm leading-7">Only Bonavista administrators can create or edit yacht entries.</p>
          </div>
        ) : editorQuery.isLoading ? (
          <div className="rounded-3xl border bg-white p-8 text-sm text-slate-500">Loading yacht data...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-6">
                <section className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Core fields</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Field label="Name"><input className={inputClass} value={form.name} onChange={(e) => updateField(setForm, "name", e.target.value)} /></Field>
                    <Field label="Type"><input className={inputClass} value={form.type} onChange={(e) => updateField(setForm, "type", e.target.value)} /></Field>
                    <Field label="Guest capacity"><input className={inputClass} inputMode="numeric" value={form.guestCapacity} onChange={(e) => updateField(setForm, "guestCapacity", onlyDigits(e.target.value))} /></Field>
                    <Field label="Base price"><input className={inputClass} inputMode="numeric" value={form.price} onChange={(e) => updateField(setForm, "price", onlyDigits(e.target.value))} /></Field>
                    <Field label="Status">
                      <select className={inputClass} value={form.status} onChange={(e) => updateField(setForm, "status", e.target.value as "draft" | "published") }>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </Field>
                    <Field label="Currency"><input className={inputClass} value={form.currency} onChange={(e) => updateField(setForm, "currency", e.target.value.toUpperCase())} /></Field>
                  </div>
                  <Field className="mt-4" label="Description">
                    <textarea className={`${inputClass} min-h-32`} value={form.description} onChange={(e) => updateField(setForm, "description", e.target.value)} />
                  </Field>
                </section>

                <section className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Location and rental terms</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Field label="Marina name"><input className={inputClass} value={form.marinaName} onChange={(e) => updateField(setForm, "marinaName", e.target.value)} /></Field>
                    <Field label="Short location label"><input className={inputClass} value={form.shortLocationLabel} onChange={(e) => updateField(setForm, "shortLocationLabel", e.target.value)} /></Field>
                    <Field label="City"><input className={inputClass} value={form.city} onChange={(e) => updateField(setForm, "city", e.target.value)} /></Field>
                    <Field label="Country"><input className={inputClass} value={form.country} onChange={(e) => updateField(setForm, "country", e.target.value)} /></Field>
                    <Field label="Latitude"><input className={inputClass} inputMode="decimal" value={form.latitude} onChange={(e) => updateField(setForm, "latitude", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Longitude"><input className={inputClass} inputMode="decimal" value={form.longitude} onChange={(e) => updateField(setForm, "longitude", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Rental type"><input className={inputClass} value={form.rentalType} onChange={(e) => updateField(setForm, "rentalType", e.target.value)} placeholder="with crew" /></Field>
                    <Field label="Minimum order hours"><input className={inputClass} inputMode="numeric" value={form.minimumOrderHours} onChange={(e) => updateField(setForm, "minimumOrderHours", onlyDigits(e.target.value))} /></Field>
                    <Field label="Minimum order unit"><input className={inputClass} value={form.minimumOrderUnit} onChange={(e) => updateField(setForm, "minimumOrderUnit", e.target.value)} /></Field>
                    <Field label="Hero badge"><input className={inputClass} value={form.heroBadge} onChange={(e) => updateField(setForm, "heroBadge", e.target.value)} placeholder="WITH CAPTAIN (INCLUDED)" /></Field>
                  </div>
                  <Field className="mt-4" label="Berth location text">
                    <textarea className={`${inputClass} min-h-24`} value={form.berthLocationText} onChange={(e) => updateField(setForm, "berthLocationText", e.target.value)} />
                  </Field>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <CheckboxField label="Captain included" checked={form.captainIncluded} onCheckedChange={(value) => updateField(setForm, "captainIncluded", value)} />
                    <CheckboxField label="Crew included" checked={form.crewIncluded} onCheckedChange={(value) => updateField(setForm, "crewIncluded", value)} />
                  </div>
                </section>

                <section className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Technical specifications</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <Field label="Model name"><input className={inputClass} value={form.modelName} onChange={(e) => updateField(setForm, "modelName", e.target.value)} /></Field>
                    <Field label="Boat category"><input className={inputClass} value={form.boatCategory} onChange={(e) => updateField(setForm, "boatCategory", e.target.value)} /></Field>
                    <Field label="Internal reference ID"><input className={inputClass} value={form.internalReferenceId} onChange={(e) => updateField(setForm, "internalReferenceId", e.target.value)} /></Field>
                    <Field label="Length value"><input className={inputClass} inputMode="decimal" value={form.lengthValue} onChange={(e) => updateField(setForm, "lengthValue", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Length unit"><input className={inputClass} value={form.lengthUnit} onChange={(e) => updateField(setForm, "lengthUnit", e.target.value)} /></Field>
                    <Field label="Beam value"><input className={inputClass} inputMode="decimal" value={form.beamValue} onChange={(e) => updateField(setForm, "beamValue", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Beam unit"><input className={inputClass} value={form.beamUnit} onChange={(e) => updateField(setForm, "beamUnit", e.target.value)} /></Field>
                    <Field label="Draft value"><input className={inputClass} inputMode="decimal" value={form.draftValue} onChange={(e) => updateField(setForm, "draftValue", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Draft unit"><input className={inputClass} value={form.draftUnit} onChange={(e) => updateField(setForm, "draftUnit", e.target.value)} /></Field>
                    <Field label="Year built"><input className={inputClass} inputMode="numeric" value={form.yearBuilt} onChange={(e) => updateField(setForm, "yearBuilt", onlyDigits(e.target.value))} /></Field>
                    <Field label="Toilets count"><input className={inputClass} inputMode="numeric" value={form.toiletsCount} onChange={(e) => updateField(setForm, "toiletsCount", onlyDigits(e.target.value))} /></Field>
                    <Field label="Engine spec"><input className={inputClass} value={form.engineSpec} onChange={(e) => updateField(setForm, "engineSpec", e.target.value)} placeholder="228 hp" /></Field>
                    <Field label="Cruising speed"><input className={inputClass} inputMode="decimal" value={form.cruisingSpeedValue} onChange={(e) => updateField(setForm, "cruisingSpeedValue", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Cruising speed unit"><input className={inputClass} value={form.cruisingSpeedUnit} onChange={(e) => updateField(setForm, "cruisingSpeedUnit", e.target.value)} /></Field>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Pricing and CTAs</h2>
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <Field label="Pricing mode">
                      <select className={inputClass} value={form.pricingMode} onChange={(e) => updateField(setForm, "pricingMode", e.target.value as "fixed" | "tiered") }>
                        <option value="fixed">Fixed</option>
                        <option value="tiered">Tiered</option>
                      </select>
                    </Field>
                    <Field label="Base price label"><input className={inputClass} value={form.basePriceLabel} onChange={(e) => updateField(setForm, "basePriceLabel", e.target.value)} placeholder="from €375/hour" /></Field>
                    <Field label="VAT rate"><input className={inputClass} inputMode="decimal" value={form.vatRate} onChange={(e) => updateField(setForm, "vatRate", onlyDecimal(e.target.value))} /></Field>
                    <Field label="Primary CTA label"><input className={inputClass} value={form.ctaPrimaryLabel} onChange={(e) => updateField(setForm, "ctaPrimaryLabel", e.target.value)} /></Field>
                    <Field label="Secondary CTA label"><input className={inputClass} value={form.ctaSecondaryLabel} onChange={(e) => updateField(setForm, "ctaSecondaryLabel", e.target.value)} /></Field>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <CheckboxField label="VAT included" checked={form.vatIncluded} onCheckedChange={(value) => updateField(setForm, "vatIncluded", value)} />
                    <CheckboxField label="Similar boats block enabled" checked={form.similarBoatsEnabled} onCheckedChange={(value) => updateField(setForm, "similarBoatsEnabled", value)} />
                  </div>
                  <Field className="mt-4" label="Pricing notes">
                    <textarea className={`${inputClass} min-h-24`} value={form.pricingNotes} onChange={(e) => updateField(setForm, "pricingNotes", e.target.value)} />
                  </Field>
                  <Field className="mt-4" label="Booking help text">
                    <textarea className={`${inputClass} min-h-24`} value={form.bookingHelpText} onChange={(e) => updateField(setForm, "bookingHelpText", e.target.value)} />
                  </Field>
                  <Field className="mt-4" label="Extra service notes">
                    <textarea className={`${inputClass} min-h-24`} value={form.extraServiceNotes} onChange={(e) => updateField(setForm, "extraServiceNotes", e.target.value)} />
                  </Field>
                  <Field className="mt-4" label="Service staff ratio text">
                    <textarea className={`${inputClass} min-h-24`} value={form.serviceStaffRatioText} onChange={(e) => updateField(setForm, "serviceStaffRatioText", e.target.value)} />
                  </Field>
                </section>

                <section className="rounded-3xl border bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Rules and social proof</h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <CheckboxField label="Smoking allowed" checked={form.smokingAllowed} onCheckedChange={(value) => updateField(setForm, "smokingAllowed", value)} />
                    <CheckboxField label="Pets allowed" checked={form.petsAllowed} onCheckedChange={(value) => updateField(setForm, "petsAllowed", value)} />
                    <CheckboxField label="Party allowed" checked={form.partyAllowed} onCheckedChange={(value) => updateField(setForm, "partyAllowed", value)} />
                    <CheckboxField label="Children allowed" checked={form.childrenAllowed} onCheckedChange={(value) => updateField(setForm, "childrenAllowed", value)} />
                    <CheckboxField label="Reviews enabled" checked={form.reviewsEnabled} onCheckedChange={(value) => updateField(setForm, "reviewsEnabled", value)} />
                    <CheckboxField label="Verified reviews only" checked={form.verifiedReviewsOnly} onCheckedChange={(value) => updateField(setForm, "verifiedReviewsOnly", value)} />
                  </div>
                  <Field className="mt-4" label="Review count">
                    <input className={inputClass} inputMode="numeric" value={form.reviewCount} onChange={(e) => updateField(setForm, "reviewCount", onlyDigits(e.target.value))} />
                  </Field>
                  <Field className="mt-4" label="Rules notes">
                    <textarea className={`${inputClass} min-h-24`} value={form.rulesNotes} onChange={(e) => updateField(setForm, "rulesNotes", e.target.value)} />
                  </Field>
                </section>

                <section className="rounded-3xl border bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-950">Photos</h2>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        Upload multiple yacht images, choose a cover photo, reorder the gallery, and remove unused media.
                      </p>
                    </div>
                    <label className="inline-flex cursor-pointer items-center rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      <ImagePlus className="mr-2 h-4 w-4" />
                      Upload photos
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                  <div className="mt-6 space-y-4">
                    {form.photos.length ? form.photos.map((photo, index) => (
                      <div key={`${photo.storageKey}-${index}`} className="rounded-2xl border p-4">
                        <div className="flex flex-col gap-4 md:flex-row">
                          <img src={photo.url} alt="Yacht photo" className="h-32 w-full rounded-2xl object-cover md:w-40" />
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <Button variant={photo.isCover ? "default" : "outline"} size="sm" onClick={() => setForm((current) => ({ ...current, photos: current.photos.map((item, itemIndex) => ({ ...item, isCover: itemIndex === index })) }))}>
                                {photo.isCover ? "Cover photo" : "Set as cover"}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => setForm((current) => ({ ...current, photos: moveItem(current.photos, index, -1) }))}><ArrowUp className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm" onClick={() => setForm((current) => ({ ...current, photos: moveItem(current.photos, index, 1) }))}><ArrowDown className="h-4 w-4" /></Button>
                              <Button variant="outline" size="sm" onClick={() => setForm((current) => ({ ...current, photos: removePhotoAt(current.photos, index) }))}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                            <p className="break-all text-xs leading-6 text-slate-500">{photo.url}</p>
                          </div>
                        </div>
                      </div>
                    )) : <div className="rounded-2xl border border-dashed p-6 text-sm text-slate-500">No photos uploaded yet.</div>}
                  </div>
                </section>
              </div>
            </div>

            <ArraySection title="Detail paragraphs" description="Long-form narrative blocks for the yacht experience page.">
              {form.details.map((item, index) => (
                <StringRow
                  key={`detail-${index}`}
                  value={item}
                  onChange={(value) => setForm((current) => ({ ...current, details: replaceAt(current.details, index, value) }))}
                  onMoveUp={() => setForm((current) => ({ ...current, details: moveItem(current.details, index, -1) }))}
                  onMoveDown={() => setForm((current) => ({ ...current, details: moveItem(current.details, index, 1) }))}
                  onRemove={() => setForm((current) => ({ ...current, details: removeAt(current.details, index, "") }))}
                />
              ))}
              <Button variant="outline" onClick={() => setForm((current) => ({ ...current, details: [...current.details, ""] }))}>
                <Plus className="mr-2 h-4 w-4" />Add paragraph
              </Button>
            </ArraySection>

            <div className="grid gap-6 lg:grid-cols-2">
              <ArraySection title="Amenities" description="General amenities for the listing and summary cards.">
                {form.amenities.map((item, index) => (
                  <StringRow
                    key={`amenity-${index}`}
                    value={item}
                    onChange={(value) => setForm((current) => ({ ...current, amenities: replaceAt(current.amenities, index, value) }))}
                    onMoveUp={() => setForm((current) => ({ ...current, amenities: moveItem(current.amenities, index, -1) }))}
                    onMoveDown={() => setForm((current) => ({ ...current, amenities: moveItem(current.amenities, index, 1) }))}
                    onRemove={() => setForm((current) => ({ ...current, amenities: removeAt(current.amenities, index, "") }))}
                  />
                ))}
                <Button variant="outline" onClick={() => setForm((current) => ({ ...current, amenities: [...current.amenities, ""] }))}><Plus className="mr-2 h-4 w-4" />Add amenity</Button>
              </ArraySection>

              <ArraySection title="Included services" description="Items explicitly included in the charter price.">
                {form.includedServices.map((item, index) => (
                  <StringRow
                    key={`included-${index}`}
                    value={item}
                    onChange={(value) => setForm((current) => ({ ...current, includedServices: replaceAt(current.includedServices, index, value) }))}
                    onMoveUp={() => setForm((current) => ({ ...current, includedServices: moveItem(current.includedServices, index, -1) }))}
                    onMoveDown={() => setForm((current) => ({ ...current, includedServices: moveItem(current.includedServices, index, 1) }))}
                    onRemove={() => setForm((current) => ({ ...current, includedServices: removeAt(current.includedServices, index, "") }))}
                  />
                ))}
                <Button variant="outline" onClick={() => setForm((current) => ({ ...current, includedServices: [...current.includedServices, ""] }))}><Plus className="mr-2 h-4 w-4" />Add service</Button>
              </ArraySection>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <ArraySection title="Equipment" description="Onboard technical and comfort equipment list.">
                {form.equipment.map((item, index) => (
                  <StringRow
                    key={`equipment-${index}`}
                    value={item}
                    onChange={(value) => setForm((current) => ({ ...current, equipment: replaceAt(current.equipment, index, value) }))}
                    onMoveUp={() => setForm((current) => ({ ...current, equipment: moveItem(current.equipment, index, -1) }))}
                    onMoveDown={() => setForm((current) => ({ ...current, equipment: moveItem(current.equipment, index, 1) }))}
                    onRemove={() => setForm((current) => ({ ...current, equipment: removeAt(current.equipment, index, "") }))}
                  />
                ))}
                <Button variant="outline" onClick={() => setForm((current) => ({ ...current, equipment: [...current.equipment, ""] }))}><Plus className="mr-2 h-4 w-4" />Add equipment</Button>
              </ArraySection>

              <PairSection
                title="Features"
                description="Structured key-value feature pairs such as guests, model notes, or charter facts."
                items={form.features}
                onChange={(items) => setForm((current) => ({ ...current, features: items }))}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PairSection
                title="Custom fields"
                description="Flexible key-value fields for anything not yet modelled as a dedicated column."
                items={form.customFields}
                onChange={(items) => setForm((current) => ({ ...current, customFields: items }))}
              />

              <PricingTierSection
                items={form.pricingTiers}
                onChange={(items) => setForm((current) => ({ ...current, pricingTiers: items }))}
              />
            </div>

            <ExtraFeeSection
              items={form.extraFees}
              onChange={(items) => setForm((current) => ({ ...current, extraFees: items }))}
            />
          </div>
        )}

        {user?.role === "admin" && (
          <div className="sticky bottom-4 z-20">
            <div className="flex flex-col gap-3 rounded-3xl border border-sky-200 bg-white/95 p-4 shadow-lg backdrop-blur md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Save and draft protection</p>
                <p className={`text-sm ${saveState === "error" ? "text-rose-600" : saveState === "saved" ? "text-emerald-600" : "text-slate-600"}`}>
                  {saveState === "saving" ? "Saving your yacht draft to the database..." : saveState === "saved" ? "Your latest changes are already stored in the database." : saveState === "dirty" ? "Changes detected. Autosave will run shortly, or you can save now." : saveState === "error" ? "Autosave failed. Use Save yacht to retry." : "Use Save yacht any time. Drafts also autosave while you work."}
                </p>
              </div>
              <Button className="w-full md:w-auto" onClick={handleSave} disabled={isBusy}>{saveMutation.isPending || autosaveMutation.isPending ? "Saving..." : "Save yacht"}</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CheckboxField({ label, checked, onCheckedChange }: { label: string; checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />
      <span>{label}</span>
    </label>
  );
}

function ArraySection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function StringRow({ value, onChange, onMoveUp, onMoveDown, onRemove }: { value: string; onChange: (value: string) => void; onMoveUp: () => void; onMoveDown: () => void; onRemove: () => void }) {
  return (
    <div className="rounded-2xl border p-4">
      <textarea className={`${inputClass} min-h-24`} value={value} onChange={(e) => onChange(e.target.value)} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onMoveUp}><ArrowUp className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={onMoveDown}><ArrowDown className="h-4 w-4" /></Button>
        <Button variant="outline" size="sm" onClick={onRemove}><Trash2 className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}

function PairSection({ title, description, items, onChange }: { title: string; description: string; items: Pair[]; onChange: (items: Pair[]) => void }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="rounded-2xl border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input className={inputClass} placeholder="Label" value={item.key} onChange={(e) => onChange(replaceAt(items, index, { ...item, key: e.target.value }))} />
              <input className={inputClass} placeholder="Value" value={item.value} onChange={(e) => onChange(replaceAt(items, index, { ...item, value: e.target.value }))} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onChange(moveItem(items, index, -1))}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onChange(moveItem(items, index, 1))}><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onChange(removeAt(items, index, { key: "", value: "" }))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={() => onChange([...items, { key: "", value: "" }])}><Plus className="mr-2 h-4 w-4" />Add pair</Button>
      </div>
    </section>
  );
}

function PricingTierSection({ items, onChange }: { items: PricingTier[]; onChange: (items: PricingTier[]) => void }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">Pricing tiers</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Set season-based or guest-range-based prices similar to Barcelona Boat Rental.</p>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={`pricing-tier-${index}`} className="rounded-2xl border p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <input className={inputClass} placeholder="Season label" value={item.seasonLabel} onChange={(e) => onChange(replaceAt(items, index, { ...item, seasonLabel: e.target.value }))} />
              <input className={inputClass} placeholder="Min hours" inputMode="numeric" value={item.minHours} onChange={(e) => onChange(replaceAt(items, index, { ...item, minHours: onlyDigits(e.target.value) }))} />
              <input className={inputClass} placeholder="Min guests" inputMode="numeric" value={item.minGuests} onChange={(e) => onChange(replaceAt(items, index, { ...item, minGuests: onlyDigits(e.target.value) }))} />
              <input className={inputClass} placeholder="Max guests" inputMode="numeric" value={item.maxGuests} onChange={(e) => onChange(replaceAt(items, index, { ...item, maxGuests: onlyDigits(e.target.value) }))} />
              <input className={inputClass} placeholder="Price" inputMode="numeric" value={item.price} onChange={(e) => onChange(replaceAt(items, index, { ...item, price: onlyDigits(e.target.value) }))} />
              <input className={inputClass} placeholder="Currency" value={item.currency} onChange={(e) => onChange(replaceAt(items, index, { ...item, currency: e.target.value.toUpperCase() }))} />
            </div>
            <textarea className={`${inputClass} mt-3 min-h-24`} placeholder="Notes" value={item.notes} onChange={(e) => onChange(replaceAt(items, index, { ...item, notes: e.target.value }))} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onChange(moveItem(items, index, -1))}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onChange(moveItem(items, index, 1))}><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onChange(removeAt(items, index, { seasonLabel: "", minHours: "", minGuests: "", maxGuests: "", price: "", currency: "EUR", notes: "" }))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={() => onChange([...items, { seasonLabel: "", minHours: "", minGuests: "", maxGuests: "", price: "", currency: "EUR", notes: "" }])}><Plus className="mr-2 h-4 w-4" />Add pricing tier</Button>
      </div>
    </section>
  );
}

function ExtraFeeSection({ items, onChange }: { items: ExtraFee[]; onChange: (items: ExtraFee[]) => void }) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">Extra fees</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">Capture mandatory bar packages, waiter costs, coordination fees, and other paid add-ons.</p>
      <div className="mt-6 space-y-4">
        {items.map((item, index) => (
          <div key={`extra-fee-${index}`} className="rounded-2xl border p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <input className={inputClass} placeholder="Fee type" value={item.feeType} onChange={(e) => onChange(replaceAt(items, index, { ...item, feeType: e.target.value }))} />
              <input className={inputClass} placeholder="Label" value={item.label} onChange={(e) => onChange(replaceAt(items, index, { ...item, label: e.target.value }))} />
              <input className={inputClass} placeholder="Pricing model" value={item.pricingModel} onChange={(e) => onChange(replaceAt(items, index, { ...item, pricingModel: e.target.value }))} />
              <input className={inputClass} placeholder="Amount" inputMode="numeric" value={item.amount} onChange={(e) => onChange(replaceAt(items, index, { ...item, amount: onlyDigits(e.target.value) }))} />
              <input className={inputClass} placeholder="Currency" value={item.currency} onChange={(e) => onChange(replaceAt(items, index, { ...item, currency: e.target.value.toUpperCase() }))} />
              <input className={inputClass} placeholder="Unit label" value={item.unitLabel} onChange={(e) => onChange(replaceAt(items, index, { ...item, unitLabel: e.target.value }))} />
            </div>
            <textarea className={`${inputClass} mt-3 min-h-24`} placeholder="Notes" value={item.notes} onChange={(e) => onChange(replaceAt(items, index, { ...item, notes: e.target.value }))} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => onChange(moveItem(items, index, -1))}><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onChange(moveItem(items, index, 1))}><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" onClick={() => onChange(removeAt(items, index, { feeType: "", label: "", pricingModel: "", amount: "", currency: "EUR", unitLabel: "", notes: "" }))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={() => onChange([...items, { feeType: "", label: "", pricingModel: "", amount: "", currency: "EUR", unitLabel: "", notes: "" }])}><Plus className="mr-2 h-4 w-4" />Add extra fee</Button>
      </div>
    </section>
  );
}

function replaceAt<T>(items: T[], index: number, value: T) {
  return items.map((item, itemIndex) => (itemIndex === index ? value : item));
}

function moveItem<T>(items: T[], index: number, delta: number) {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  return next;
}

function removeAt<T>(items: T[], index: number, fallback: T) {
  const next = items.filter((_, itemIndex) => itemIndex !== index);
  return next.length ? next : [fallback];
}

function removePhotoAt(items: Photo[], index: number) {
  const next = items.filter((_, itemIndex) => itemIndex !== index);
  if (next.length && !next.some((item) => item.isCover)) next[0]!.isCover = true;
  return next;
}

function onlyDigits(value: string) {
  return value.replace(/[^0-9]/g, "");
}

function onlyDecimal(value: string) {
  const cleaned = value.replace(/[^0-9.-]/g, "");
  const negative = cleaned.startsWith("-") ? "-" : "";
  const unsigned = cleaned.replace(/-/g, "");
  const [head, ...tail] = unsigned.split(".");
  return `${negative}${head ?? ""}${tail.length ? `.${tail.join("")}` : ""}`;
}

function normalizePhotos(items: Photo[]) {
  const cleaned = items.filter((item) => item.url && item.storageKey);
  if (cleaned.length && !cleaned.some((item) => item.isCover)) cleaned[0]!.isCover = true;
  return cleaned;
}

function toNullableInt(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildSavePayload(form: YachtFormState, yachtId?: number) {
  return {
    id: yachtId,
    name: form.name,
    type: form.type,
    status: form.status,
    guestCapacity: toNullableInt(form.guestCapacity),
    price: toNullableInt(form.price),
    description: form.description,
    marinaName: form.marinaName,
    city: form.city,
    country: form.country,
    berthLocationText: form.berthLocationText,
    latitude: form.latitude,
    longitude: form.longitude,
    rentalType: form.rentalType,
    captainIncluded: form.captainIncluded,
    crewIncluded: form.crewIncluded,
    minimumOrderHours: toNullableInt(form.minimumOrderHours),
    minimumOrderUnit: form.minimumOrderUnit,
    lengthValue: form.lengthValue,
    lengthUnit: form.lengthUnit,
    beamValue: form.beamValue,
    beamUnit: form.beamUnit,
    draftValue: form.draftValue,
    draftUnit: form.draftUnit,
    yearBuilt: toNullableInt(form.yearBuilt),
    modelName: form.modelName,
    boatCategory: form.boatCategory,
    internalReferenceId: form.internalReferenceId,
    toiletsCount: toNullableInt(form.toiletsCount),
    engineSpec: form.engineSpec,
    cruisingSpeedValue: form.cruisingSpeedValue,
    cruisingSpeedUnit: form.cruisingSpeedUnit,
    currency: form.currency,
    pricingMode: form.pricingMode,
    basePriceLabel: form.basePriceLabel,
    vatIncluded: form.vatIncluded,
    vatRate: form.vatRate,
    pricingNotes: form.pricingNotes,
    heroBadge: form.heroBadge,
    shortLocationLabel: form.shortLocationLabel,
    ctaPrimaryLabel: form.ctaPrimaryLabel,
    ctaSecondaryLabel: form.ctaSecondaryLabel,
    bookingHelpText: form.bookingHelpText,
    extraServiceNotes: form.extraServiceNotes,
    serviceStaffRatioText: form.serviceStaffRatioText,
    smokingAllowed: form.smokingAllowed,
    petsAllowed: form.petsAllowed,
    partyAllowed: form.partyAllowed,
    childrenAllowed: form.childrenAllowed,
    rulesNotes: form.rulesNotes,
    reviewsEnabled: form.reviewsEnabled,
    reviewCount: toNullableInt(form.reviewCount),
    verifiedReviewsOnly: form.verifiedReviewsOnly,
    similarBoatsEnabled: form.similarBoatsEnabled,
    details: form.details,
    amenities: form.amenities,
    includedServices: form.includedServices,
    equipment: form.equipment,
    features: form.features,
    customFields: form.customFields,
    pricingTiers: form.pricingTiers.map((item) => ({
      seasonLabel: item.seasonLabel,
      minHours: toNullableInt(item.minHours),
      minGuests: toNullableInt(item.minGuests),
      maxGuests: toNullableInt(item.maxGuests),
      price: toNullableInt(item.price),
      currency: item.currency,
      notes: item.notes,
    })),
    extraFees: form.extraFees.map((item) => ({
      feeType: item.feeType,
      label: item.label,
      pricingModel: item.pricingModel,
      amount: toNullableInt(item.amount),
      currency: item.currency,
      unitLabel: item.unitLabel,
      notes: item.notes,
    })),
    photos: normalizePhotos(form.photos),
  };
}

function updateField<K extends keyof YachtFormState>(setForm: Dispatch<SetStateAction<YachtFormState>>, key: K, value: YachtFormState[K]) {
  setForm((current) => ({ ...current, [key]: value }));
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(reader.error ?? new Error("File could not be read"));
    reader.readAsDataURL(file);
  });
}

const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
