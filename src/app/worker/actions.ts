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

const TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["in_progress", "cancelled"],
  in_progress: ["completed"],
};

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/worker/login");
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("auth_user_id", userData.user.id)
    .single();

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
