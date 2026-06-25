import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  confirmItemsCollected,
  markDelivered,
  updateBookingStatus,
  workerSignOut,
} from "@/app/worker/actions";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "collected"
  | "washing"
  | "out_for_delivery"
  | "delivered"
  | "in_progress"
  | "completed"
  | "cancelled";

type BookingRow = {
  id: string;
  status: BookingStatus;
  is_instant: boolean;
  scheduled_at: string | null;
  address: string;
  notes: string | null;
  price_estimate: number | null;
  payment_method: string;
  payment_status: string;
  delivered_at: string | null;
  customer_confirmed_at: string | null;
  created_at: string;
  customer: { full_name: string | null; phone: string | null } | null;
  category: { name: string } | null;
  booking_items: { item_type: string; quantity: number }[];
};

const STATUS_LABEL: Record<string, string> = {
  pending: "New request",
  confirmed: "Accepted",
  collected: "Collected",
  washing: "Washing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

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

      {booking.status !== "confirmed" && booking.booking_items.length > 0 && (
        <ul className="text-sm text-neutral-600 list-disc pl-5">
          {booking.booking_items.map((it, i) => (
            <li key={i}>
              {ITEM_LABELS[it.item_type] ?? it.item_type} × {it.quantity}
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-1">
        <span className="font-semibold">
          {booking.price_estimate != null ? `₹${booking.price_estimate}` : "—"}
          <span className="text-xs text-neutral-500 font-normal">
            {" "}
            ·{" "}
            {booking.payment_method === "online"
              ? "Online"
              : booking.payment_status === "paid"
                ? "Cash collected"
                : "Cash on delivery"}
          </span>
        </span>
      </div>

      {booking.status === "pending" && (
        <div className="flex gap-2 pt-2">
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
        </div>
      )}

      {booking.status === "confirmed" && (
        <form action={confirmItemsCollected} className="pt-2 space-y-2 border-t border-[#f0d8db] mt-2">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide pt-2">
            Confirm items collected
          </p>
          {booking.booking_items.length === 0 ? (
            <p className="text-sm text-neutral-400">No items on this order.</p>
          ) : (
            booking.booking_items.map((it) => (
              <div key={it.item_type} className="flex items-center justify-between gap-2">
                <label className="text-sm">{ITEM_LABELS[it.item_type] ?? it.item_type}</label>
                <input
                  type="number"
                  min={0}
                  name={`qty_${it.item_type}`}
                  defaultValue={it.quantity}
                  className="input w-20 text-center"
                />
              </div>
            ))
          )}
          <input type="hidden" name="booking_id" value={booking.id} />
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-primary">
              Confirm items collected
            </button>
            <button
              type="submit"
              formAction={updateBookingStatus}
              name="new_status"
              value="cancelled"
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {booking.status === "collected" && (
        <div className="flex gap-2 pt-2">
          <form action={updateBookingStatus}>
            <input type="hidden" name="booking_id" value={booking.id} />
            <input type="hidden" name="new_status" value="washing" />
            <button type="submit" className="btn-primary">
              Sent for washing
            </button>
          </form>
          <form action={updateBookingStatus}>
            <input type="hidden" name="booking_id" value={booking.id} />
            <input type="hidden" name="new_status" value="cancelled" />
            <button type="submit" className="btn-outline">
              Cancel
            </button>
          </form>
        </div>
      )}

      {booking.status === "washing" && (
        <div className="flex gap-2 pt-2">
          <form action={updateBookingStatus}>
            <input type="hidden" name="booking_id" value={booking.id} />
            <input type="hidden" name="new_status" value="out_for_delivery" />
            <button type="submit" className="btn-primary">
              Out for delivery
            </button>
          </form>
        </div>
      )}

      {booking.status === "out_for_delivery" && (
        <div className="pt-2">
          {booking.payment_method === "cod" && (
            <p className="text-xs text-neutral-500 pb-1">
              Collect ₹{booking.price_estimate} cash on delivery before confirming.
            </p>
          )}
          <form action={markDelivered}>
            <input type="hidden" name="booking_id" value={booking.id} />
            <button type="submit" className="btn-primary">
              {booking.payment_method === "cod" ? "Mark delivered & payment received" : "Mark delivered"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

const IST_OFFSET = "+05:30";

function istDayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00${IST_OFFSET}`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function todayIST(): string {
  // Render "today" in IST regardless of server timezone.
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 + now.getTimezoneOffset()) * 60 * 1000);
  return ist.toISOString().slice(0, 10);
}

export default async function WorkerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const selectedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : todayIST();
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
      `id, status, is_instant, scheduled_at, address, notes, price_estimate, payment_method, payment_status, delivered_at, customer_confirmed_at, created_at,
       customer:profiles(full_name, phone),
       category:service_categories(name),
       booking_items(item_type, quantity)`
    )
    .eq("provider_id", provider.id)
    .order("created_at", { ascending: false })
    .returns<BookingRow[]>();

  const rows = bookings ?? [];
  const pending = rows.filter((b) => b.status === "pending");
  const collectedCount = rows.filter((b) => b.status === "collected").length;
  const washingCount = rows.filter((b) => b.status === "washing").length;
  const outForDeliveryCount = rows.filter((b) => b.status === "out_for_delivery").length;
  const active = rows.filter((b) =>
    ["confirmed", "collected", "washing", "out_for_delivery"].includes(b.status)
  );
  const history = rows
    .filter((b) => b.status === "delivered" || b.status === "cancelled")
    .slice(0, 10);

  const paidDelivered = rows.filter(
    (b) => b.status === "delivered" && b.payment_status === "paid"
  );
  const allTimeEarnings = paidDelivered.reduce((sum, b) => sum + (b.price_estimate ?? 0), 0);

  const { start, end } = istDayRange(selectedDate);
  const dayEarnings = paidDelivered
    .filter((b) => {
      if (!b.delivered_at) return false;
      const d = new Date(b.delivered_at);
      return d >= start && d < end;
    })
    .reduce((sum, b) => sum + (b.price_estimate ?? 0), 0);

  const isToday = selectedDate === todayIST();

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

      <section className="grid grid-cols-2 gap-2">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold">{pending.length}</p>
          <p className="text-xs text-neutral-500">New requests</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold">{collectedCount}</p>
          <p className="text-xs text-neutral-500">Collected</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold">{washingCount}</p>
          <p className="text-xs text-neutral-500">Washing</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold">{outForDeliveryCount}</p>
          <p className="text-xs text-neutral-500">Out for delivery</p>
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-neutral-500">
          Earnings
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">All-time</span>
          <span className="text-xl font-bold">₹{allTimeEarnings}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-500">
            {isToday ? "Today" : selectedDate}
          </span>
          <span className="text-xl font-bold">₹{dayEarnings}</span>
        </div>
        <form className="flex items-center gap-2 pt-1" method="get">
          <input
            type="date"
            name="date"
            defaultValue={selectedDate}
            max={todayIST()}
            className="input flex-1 !py-1.5 text-sm"
          />
          <button type="submit" className="btn-outline text-sm !py-1.5">
            View
          </button>
        </form>
      </section>

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
