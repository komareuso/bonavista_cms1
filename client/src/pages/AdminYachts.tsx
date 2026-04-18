import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Pencil, Plus, ShieldAlert } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminYachts() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const yachts = trpc.yachts.adminList.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  return (
    <DashboardLayout>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-4 rounded-3xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-700">Bonavista CMS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Yacht listings</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Review all fleet entries, open any yacht for editing, and add new vessels to the live Bonavista database.
            </p>
          </div>
          <Button onClick={() => setLocation("/cms/yachts/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add yacht
          </Button>
        </section>

        {loading ? (
          <div className="rounded-3xl border bg-white p-8 text-sm text-slate-500">Checking access rights...</div>
        ) : user?.role !== "admin" ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-slate-700">
            <div className="mb-3 flex items-center gap-3 text-amber-900">
              <ShieldAlert className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Admin access required</h2>
            </div>
            <p className="text-sm leading-7">Only Bonavista administrators can manage fleet entries from this area.</p>
          </div>
        ) : yachts.isLoading ? (
          <div className="rounded-3xl border bg-white p-8 text-sm text-slate-500">Loading yachts...</div>
        ) : yachts.data && yachts.data.length > 0 ? (
          <section className="overflow-hidden rounded-3xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Guests</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Updated</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {yachts.data.map((yacht) => (
                    <tr key={yacht.id} className="hover:bg-slate-50/80">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {yacht.coverPhotoUrl ? (
                            <img src={yacht.coverPhotoUrl} alt={yacht.name} className="h-14 w-20 rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-500">No image</div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-950">{yacht.name}</p>
                            <p className="text-xs text-slate-500">/{yacht.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{yacht.type}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${yacht.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {yacht.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{yacht.guestCapacity ?? "—"}</td>
                      <td className="px-6 py-4">{yacht.price ? `€${yacht.price.toLocaleString()}` : "On request"}</td>
                      <td className="px-6 py-4">{new Date(yacht.updatedAt).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => setLocation(`/cms/yachts/${yacht.id}`)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setLocation(`/experience/${yacht.slug}`)}>
                            View live
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">No yachts yet</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Start by creating the first yacht entry. After publication, it will appear automatically on the public Bonavista catalog.
            </p>
            <Button className="mt-6" onClick={() => setLocation("/cms/yachts/new")}>Create first yacht</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
