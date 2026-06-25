import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { cancelBooking } from "@/app/actions";

const STEPS = ["pending", "confirmed", "in_progress", "completed"] as const;

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?next=/bookings/${id}`);
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, status, is_instant, scheduled_at, address, notes, price_estimate, payment_method, created_at, providers(full_name, phone), service_categories(name)"
    )
    .eq("id", id)
    .single();

  if (!booking) {
    notFound();
  }

  const { data: history } = await supabase
    .from("booking_status_history")
    .select("status, note, created_at")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  const { data: items } = await supabase
    .from("booking_items")
    .select("item_type, quantity")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  const ITEM_LABELS: Record<string, string> = {
    shirt: "Shirt",
    pant: "Pant / Trouser",
    kurta: "Kurta / Shalwar Kameez",
    saree: "Saree",
    jacket: "Jacket / Coat",
    bedsheet: "Bedsheet",
    blanket: "Blanket / Quilt",
    curtain: "Curtain",
    shoe: "Shoes",
    towel: "Towel",
    other: "Other",
  };

  const provider = Array.isArray(booking.providers)
    ? booking.providers[0]
    : booking.providers;
  const category = Array.isArray(booking.service_categories)
    ? booking.service_categories[0]
    : booking.service_categories;

  const isCancelled = booking.status === "cancelled";
  const currentStepIndex = STEPS.indexOf(
    booking.status as (typeof STEPS)[number]
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/bookings" className="text-sm text-neutral-500 hover:underline">
        ← My Bookings
      </Link>

      <div className="flex items-center justify-between mt-2">
        <h1 className="text-2xl font-bold">
          {category?.name ?? "Service"} booking
        </h1>
        <StatusBadge status={booking.status} />
      </div>

      {!isCancelled && (
        <div className="flex items-center mt-6 mb-2">
          {STEPS.map((step, i) => (
            <div key={step} className="flex-1 flex items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  i <= currentStepIndex ? "bg-[#d21f3c]" : "bg-neutral-200"
                }`}
              />
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 ${
                    i < currentStepIndex ? "bg-[#d21f3c]" : "bg-neutral-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="card p-4 mt-6 space-y-2 text-sm">
        <div>
          <span className="text-neutral-500">Provider: </span>
          {provider?.full_name}
          {provider?.phone ? ` · ${provider.phone}` : ""}
        </div>
        <div>
          <span className="text-neutral-500">Timing: </span>
          {booking.is_instant
            ? "As soon as possible"
            : new Date(booking.scheduled_at).toLocaleString()}
        </div>
        <div>
          <span className="text-neutral-500">Address: </span>
          {booking.address}
        </div>
        {booking.notes && (
          <div>
            <span className="text-neutral-500">Notes: </span>
            {booking.notes}
          </div>
        )}
        {booking.price_estimate && (
          <div>
            <span className="text-neutral-500">Total: </span>
            ₹{booking.price_estimate}
          </div>
        )}
        {booking.payment_method && (
          <div>
            <span className="text-neutral-500">Payment: </span>
            {booking.payment_method === "cod" ? "Cash on Delivery" : "Online"}
          </div>
        )}
        <div>
          <span className="text-neutral-500">Booked on: </span>
          {new Date(booking.created_at).toLocaleString()}
        </div>
        {items && items.length > 0 && (
          <div>
            <span className="text-neutral-500">Items: </span>
            {items
              .map((it) => `${it.quantity}x ${ITEM_LABELS[it.item_type] ?? it.item_type}`)
              .join(", ")}
          </div>
        )}
      </div>

      <h2 className="font-semibold mt-6 mb-2">Status timeline</h2>
      <ul className="space-y-2 text-sm">
        {(history ?? []).map((h, i) => (
          <li key={i} className="flex items-center justify-between card px-3 py-2">
            <span>
              <StatusBadge status={h.status} />
              {h.note && (
                <span className="text-neutral-500 ml-2">{h.note}</span>
              )}
            </span>
            <span className="text-neutral-400 text-xs">
              {new Date(h.created_at).toLocaleString()}
            </span>
          </li>
        ))}
      </ul>

      {!isCancelled && booking.status === "pending" && (
        <form action={cancelBooking.bind(null, booking.id)} className="mt-6">
          <button type="submit" className="btn-outline">
            Cancel booking
          </button>
        </form>
      )}
    </div>
  );
}
