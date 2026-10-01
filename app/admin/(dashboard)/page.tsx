import { getDashboardStats } from "@/services/dashboard.service";

const statMeta = [
  { key: "newInquiries", label: "New Inquiries" },
  { key: "totalInquiries", label: "Total Inquiries" },
  { key: "galleryImages", label: "Gallery Images" },
  { key: "restaurantItems", label: "Restaurant Items" },
  { key: "cateringItems", label: "Catering Items" },
  { key: "publishedReviews", label: "Published Reviews" },
  { key: "publishedFaqs", label: "FAQs" },
] as const;

export default async function AdminDashboardPage() {
  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;
  let error: string | null = null;

  try {
    stats = await getDashboardStats();
  } catch {
    // Firestore not yet configured/seeded in this environment — show an
    // honest message rather than fabricated numbers.
    error =
      "Could not load live stats. This usually means Firebase credentials aren't configured yet in this environment.";
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-vrind-text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Real data from Firestore — nothing here is simulated.
      </p>

      {error ? (
        <p className="mt-8 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {statMeta.map((s) => (
            <div
              key={s.key}
              className="rounded-lg border border-vrind-white-border bg-vrind-surface p-5"
            >
              <p className="text-3xl font-semibold text-vrind-text-primary">
                {stats![s.key]}
              </p>
              <p className="mt-1 text-xs text-vrind-text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
