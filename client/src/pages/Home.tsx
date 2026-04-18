import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Anchor, ArrowRight, Shield } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const yachts = trpc.yachts.publicList.useQuery();

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sky-700">Bonavista</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Fleet catalog and content platform</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-3">
            <a href="#fleet" className="text-sm font-medium text-slate-700 hover:text-slate-950">Fleet</a>
            <a href="#workflow" className="text-sm font-medium text-slate-700 hover:text-slate-950">Workflow</a>
            <a href="/cms" className="text-sm font-medium text-slate-700 hover:text-slate-950">CMS login via Manus</a>
            <Button asChild>
              <a href={user?.role === "admin" ? "/cms" : "/cms"}>Open CMS</a>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        <section className="container grid gap-8 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800">
              <Shield className="h-4 w-4" /> Database-driven Bonavista catalog
            </p>
            <h2 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              A live yacht catalog connected to a secure manager CMS.
            </h2>
            <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Bonavista now reads published fleet entries directly from the database. Managers can control descriptions, amenities, feature pairs, custom fields, photos, and publication status from the CMS workspace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><a href="#fleet">Browse fleet</a></Button>
              <Button asChild size="lg" variant="outline"><a href="/cms">Manager login via Manus</a></Button>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Overview</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Metric label="Published yachts" value={String(yachts.data?.length ?? 0)} />
              <Metric label="Admin access" value="Role-based" />
              <Metric label="Media storage" value="S3" />
            </div>
            <div id="workflow" className="mt-8 rounded-3xl bg-white/10 p-5 text-sm leading-7 text-slate-200">
              <p>Managers log into the protected admin panel, create or edit yacht entries, upload gallery photos, and publish updates that appear automatically on the public catalog.</p>
            </div>
          </div>
        </section>

        <section id="fleet" className="container py-8 pb-16 lg:pb-24">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-700">Live fleet</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Published yachts</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Only yachts marked as published in the Bonavista CMS are visible here.
            </p>
          </div>

          {yachts.isLoading ? (
            <div className="mt-8 rounded-[2rem] border bg-white p-10 text-sm text-slate-500 shadow-sm">Loading fleet...</div>
          ) : yachts.data && yachts.data.length > 0 ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {yachts.data.map((yacht) => {
                const cover = yacht.photos.find((photo) => photo.isCover) ?? yacht.photos[0] ?? null;
                return (
                  <article key={yacht.id} className="overflow-hidden rounded-[2rem] border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    {cover ? (
                      <img src={cover.url} alt={yacht.name} className="h-64 w-full object-cover" />
                    ) : (
                      <div className="flex h-64 items-center justify-center bg-slate-200 text-slate-500">No image</div>
                    )}
                    <div className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{yacht.name}</h3>
                          <p className="mt-1 text-sm text-slate-500">{yacht.type}</p>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">{yacht.status}</span>
                      </div>
                      <p className="text-sm leading-7 text-slate-600">{yacht.description}</p>
                      <div className="grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Guests</p>
                          <p className="mt-1 font-semibold text-slate-950">{yacht.guestCapacity ?? "On request"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Price</p>
                          <p className="mt-1 font-semibold text-slate-950">{yacht.price ? `€${yacht.price.toLocaleString()}` : "On request"}</p>
                        </div>
                      </div>
                      {yacht.amenities.length ? (
                        <div className="flex flex-wrap gap-2">
                          {yacht.amenities.slice(0, 4).map((item) => (
                            <span key={item.id} className="rounded-full bg-slate-100 px-3 py-2 text-xs text-slate-700">{item.label}</span>
                          ))}
                        </div>
                      ) : null}
                      <a href={`/experience/${yacht.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-900">
                        Explore yacht <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[2rem] border bg-white p-10 text-center shadow-sm">
              <Anchor className="mx-auto h-10 w-10 text-sky-700" />
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">No published yachts yet</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Publish the first yacht from the Bonavista CMS and it will appear here automatically. Bonavista managers sign in with Manus authentication; standalone Google OAuth is not enabled in this build.
              </p>
              <Button asChild className="mt-6"><a href="/cms">Open CMS</a></Button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/10 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}
