"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions";
import { normalizeIndianPhone, phoneToWorkerAuthEmail } from "@/lib/phone";

export async function workerSignIn(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const phoneRaw = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");

  const national = normalizeIndianPhone(phoneRaw);
  if (!national) {
    return { error: "Enter a valid 10-digit Indian mobile number." };
  }
  const authEmail = phoneToWorkerAuthEmail(national);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error || !data.user) {
    return { error: "Incorrect mobile number or password." };
  }

  // Confirm this account is actually linked to a provider row before
  // letting them into the worker dashboard.
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .single();

  if (!provider) {
    await supabase.auth.signOut();
    return { error: "This account isn't set up as a worker. Contact Karigar support." };
  }

  redirect("/worker/dashboard");
}

export async function workerSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/worker", "layout");
  redirect("/worker/login");
}

async function getWorkerProvider(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();

  return provider;
}

// Simple, no-extra-data status flips. "collected" (needs item confirmation)
// and "delivered" (needs payment confirmation) go through their own actions
// below instead of this generic one.
const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled"],
  collected: ["washing", "cancelled"],
  washing: ["out_for_delivery"],
};

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient();
  const provider = await getWorkerProvider(supabase);
  if (!provider) {
    redirect("/worker/login");
  }

  const bookingId = String(formData.get("booking_id") || "");
  const newStatus = String(formData.get("new_status") || "");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, provider_id")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.provider_id !== provider.id) {
    return;
  }

  const allowed = TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return;
  }

  await supabase
    .from("bookings")
    .update({ status: newStatus })
    .eq("id", bookingId)
    .eq("provider_id", provider.id);

  revalidatePath("/worker/dashboard");
}

// Worker has physically collected the clothes from the customer. They confirm
// (and can correct) the quantity of each item type actually picked up; the
// total is recalculated server-side from the authoritative price list so the
// customer always sees a price that matches what was really collected.
export async function confirmItemsCollected(formData: FormData) {
  const supabase = await createClient();
  const provider = await getWorkerProvider(supabase);
  if (!provider) {
    redirect("/worker/login");
  }

  const bookingId = String(formData.get("booking_id") || "");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, provider_id")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.provider_id !== provider.id || booking.status !== "confirmed") {
    return;
  }

  const { data: items } = await supabase
    .from("booking_items")
    .select("id, item_type, quantity")
    .eq("booking_id", bookingId);

  const { data: priceRows } = await supabase
    .from("laundry_item_prices")
    .select("item_type, price_pkr");
  const priceMap = new Map((priceRows ?? []).map((p) => [p.item_type, p.price_pkr]));

  let total = 0;
  for (const item of items ?? []) {
    const raw = formData.get(`qty_${item.item_type}`);
    const qty = raw !== null ? Math.max(0, Math.floor(Number(raw))) : item.quantity;

    if (qty <= 0) {
      await supabase.from("booking_items").delete().eq("id", item.id);
      continue;
    }
    if (qty !== item.quantity) {
      await supabase.from("booking_items").update({ quantity: qty }).eq("id", item.id);
    }
    total += qty * (priceMap.get(item.item_type) ?? 0);
  }

  await supabase
    .from("bookings")
    .update({ status: "collected", price_estimate: total })
    .eq("id", bookingId)
    .eq("provider_id", provider.id);

  revalidatePath("/worker/dashboard");
}

// Final handover: mark delivered, and for Cash on Delivery jobs confirm the
// cash was actually collected at the same time.
export async function markDelivered(formData: FormData) {
  const supabase = await createClient();
  const provider = await getWorkerProvider(supabase);
  if (!provider) {
    redirect("/worker/login");
  }

  const bookingId = String(formData.get("booking_id") || "");

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status, provider_id, payment_method")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.provider_id !== provider.id || booking.status !== "out_for_delivery") {
    return;
  }

  await supabase
    .from("bookings")
    .update({
      status: "delivered",
      payment_status: booking.payment_method === "cod" ? "paid" : "pending",
    })
    .eq("id", bookingId)
    .eq("provider_id", provider.id);

  revalidatePath("/worker/dashboard");
}
