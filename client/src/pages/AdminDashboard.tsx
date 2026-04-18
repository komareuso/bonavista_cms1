import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart3, ExternalLink, Eye, Plus, ShieldAlert, ShipWheel } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const stats = trpc.yachts.dashboard.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });
  const publicCatalogUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="rounded-3xl bg-slate-950 px-8 py-10 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200">Bonavista CMS</p>
              <h1 className="text-4xl font-semibold tracking-tight">Fleet administration dashboard</h1>
              <p className="text-sm text-slate-300 sm:text-base">
                Manage yacht listings, photos, amenities, dynamic fields, and publication status from one protected workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-slate-950 hover:bg-slate-100" onClick={() => setLocation("/cms/yachts/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add yacht
              </Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => setLocation("/cms/yachts")}>
                <ShipWheel className="mr-2 h-4 w-4" />
                Open fleet list
              </Button>
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
            <p className="max-w-2xl text-sm leading-7">
              This section is available only to Bonavista administrators. Assign the current account the <strong>admin</strong> role in the database to unlock yacht management.
            </p>
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <StatCard title="Total yachts" value={stats.data?.total ?? 0} icon={<BarChart3 className="h-5 w-5" />} />
              <StatCard title="Published" value={stats.data?.published ?? 0} icon={<Eye className="h-5 w-5" />} />
              <StatCard title="Drafts" value={stats.data?.draft ?? 0} icon={<ShipWheel className="h-5 w-5" />} />
            </section>

            <section className="rounded-3xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl space-y-2">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Live public catalog link</h2>
                  <p className="text-sm leading-7 text-slate-700">
                    Newly published yachts appear on the live public catalog at this address. If you are checking an older temporary preview URL, it may not reflect the current CMS database.
                  </p>
                  <p className="break-all rounded-2xl bg-white px-4 py-3 font-mono text-sm text-sky-900 shadow-sm">
                    {publicCatalogUrl || "/"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <a href="/" target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open live public catalog
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => setLocation("/")}>View inside this tab</Button>
                </div>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">Quick actions</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                  Use the management area to create new yacht entries, update live content, upload S3-hosted images, and control publication on the public catalog.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => setLocation("/cms/yachts/new")}>Create new yacht</Button>
                  <Button variant="outline" onClick={() => setLocation("/cms/yachts")}>Manage existing yachts</Button>
                  <Button variant="outline" onClick={() => setLocation("/")}>View public site</Button>
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">Operational focus</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600">
                  <p>Published yachts are visible on the live Bonavista catalog and detail pages immediately after save.</p>
                  <p>Draft yachts remain hidden from public visitors until the status is switched to published.</p>
                  <p>Photo order, amenities, detail paragraphs, and dynamic fields are all controlled from the yacht editor.</p>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}
