import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBookingStatus, workerSignOut } from "@/app/worker/actions";

type BookingRow = {
  id: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  is_instant: boolean;
  scheduled_at: string | null;
  address: string;
  notes: string | null;
  price_estimate: number | null;
  payment_method: string;
  created_at: string;
  customer: { full_name: string | null; phone: string | null } | null;
  category: { name: string } | null;
  booking_items: { item_type: string; quantity: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "New request",
  confirmed: "Accepted",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function BookingCard({ booking }: { booking: BookingRow }) {
  const when = booking.is_instant
    ? "As soon as possible"
    : booking.scheduled_at
      ? new Date(booking.scheduled_at).toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

  return (
    <div className="card p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{booking.customer?.full_name || "Customer"}</p>
          <p className="text-sm text-neutral-500">{booking.customer?.phone}</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-[#d21f3c]">
          {STATUS_LABEL[booking.status] ?? booking.status}
        </span>
      </div>

      <p className="text-sm">
        <span className="font-medium">{booking.category?.name ?? "Service"}</span> · {when}
      </p>
      <p className="text-sm text-neutral-600">{booking.address}</p>
      {booking.notes && <p className="text-sm text-neutral-500">Note: {booking.notes}</p>}

      {booking.booking_items.length > 0 && (
        <ul className="text-sm text-neutral-600 list-disc pl-5">
          {booking.booking_items.map((it, i) => (
            <li key={i}>
              {it.item_type} × {it.quantity}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="font-semibold">
          {booking.price_estimate != null ? `₹${booking.price_estimate}` : "—"}
          <span className="text-xs text-neutral-500 font-normal">
            {" "}
            · {booking.payment_method === "online" ? "Online" : "Cash on delivery"}
          </span>
        </span>
      </div>

      {(booking.status === "pending" ||
        booking.status === "confirmed" ||
        booking.status === "in_progress") && (
        <div className="flex gap-2 pt-2">
          {booking.status === "pending" && (
            <>
              <form action={updateBookingStatus}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="new_status" value="confirmed" />
                <button type="submit" className="btn-primary">
                  Accept
                </button>
              </form>
              <form action={updateBookingStatus}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="new_status" value="cancelled" />
                <button type="submit" className="btn-outline">
                  Decline
                </button>
              </form>
            </>
          )}
          {booking.status === "confirmed" && (
            <>
              <form action={updateBookingStatus}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="new_status" value="in_progress" />
                <button type="submit" className="btn-primary">
                  Start job
                </button>
              </form>
              <form action={updateBookingStatus}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <input type="hidden" name="new_status" value="cancelled" />
                <button type="submit" className="btn-outline">
                  Cancel
                </button>
              </form>
            </>
          )}
          {booking.status === "in_progress" && (
            <form action={updateBookingStatus}>
              <input type="hidden" name="booking_id" value={booking.id} />
              <input type="hidden" name="new_status" value="completed" />
              <button type="submit" className="btn-primary">
                Mark completed
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default async function WorkerDashboardPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/worker/login");
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id, full_name")
    .eq("auth_user_id", userData.user.id)
    .single();

  if (!provider) {
    redirect("/worker/login");
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `id, status, is_instant, scheduled_at, address, notes, price_estimate, payment_method, created_at,
       customer:profiles(full_name, phone),
       category:service_categories(name),
       booking_items(item_type, quantity)`
    )
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })
    .returns<BookingRow[]>();

  const rows = bookings ?? [];
  const pending = rows.filter((b) => b.status === "pending");
  const active = rows.filter((b) => b.status === "confirmed" || b.status === "in_progress");
  const history = rows
    .filter((b) => b.status === "completed" || b.status === "cancelled")
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-md px-4 py-8 space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{provider.full_name}</h1>
          <p className="text-neutral-500 text-sm">Your jobs</p>
        </div>
        <form action={workerSignOut}>
          <button type="submit" className="btn-outline text-sm">
            Log out
          </button>
        </form>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-neutral-500">
          New requests ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-neutral-400">No new requests right now.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-neutral-500">
          Active jobs ({active.length})
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-neutral-400">No active jobs.</p>
        ) : (
          <div className="space-y-3">
            {active.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-neutral-500">
          Recent history
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-neutral-400">No completed or cancelled jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
