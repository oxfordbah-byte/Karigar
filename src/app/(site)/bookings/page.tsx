import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login?next=/bookings");
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, status, is_instant, scheduled_at, address, created_at, providers(full_name), service_categories(name)"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      <div className="space-y-3">
        {(bookings ?? []).map((b) => {
          const provider = Array.isArray(b.providers)
            ? b.providers[0]
            : b.providers;
          const category = Array.isArray(b.service_categories)
            ? b.service_categories[0]
            : b.service_categories;
          return (
            <Link
              key={b.id}
              href={`/bookings/${b.id}`}
              className="card p-4 flex items-center justify-between gap-4 hover:border-[#d21f3c] transition-colors"
            >
              <div>
                <div className="font-semibold">
                  {category?.name ?? "Service"} · {provider?.full_name}
                </div>
                <div className="text-sm text-neutral-500 mt-0.5">
                  {b.is_instant
                    ? "ASAP booking"
                    : new Date(b.scheduled_at).toLocaleString()}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  {b.address}
                </div>
              </div>
              <StatusBadge status={b.status} />
            </Link>
          );
        })}
        {(!bookings || bookings.length === 0) && (
          <p className="text-neutral-500">
            You haven&apos;t booked any services yet.{" "}
            <Link href="/" className="underline font-medium">
              Browse services
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
