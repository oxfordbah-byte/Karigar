"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

export async function signUp(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name") || "");
  const phone = String(formData.get("phone") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signIn(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

const VALID_ITEM_TYPES = new Set([
  "clothes",
  "shoes",
  "curtains",
  "bedsheets",
  "blankets",
  "other",
]);

export async function createBooking(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  const providerId = String(formData.get("provider_id") || "");
  const categoryId = String(formData.get("category_id") || "");
  const address = String(formData.get("address") || "");
  const notes = String(formData.get("notes") || "");
  const timing = String(formData.get("timing") || "instant");
  const scheduledAt = String(formData.get("scheduled_at") || "");
  const priceEstimate = formData.get("price_estimate")
    ? Number(formData.get("price_estimate"))
    : null;
  const laundryItemsRaw = formData.get("laundry_items");

  if (!address.trim()) {
    return { error: "Address is required." };
  }

  const isInstant = timing === "instant";

  if (!isInstant && !scheduledAt) {
    return { error: "Please choose a date & time for scheduled booking." };
  }

  let laundryItems: { item_type: string; quantity: number }[] = [];
  if (laundryItemsRaw) {
    try {
      const parsed = JSON.parse(String(laundryItemsRaw));
      if (Array.isArray(parsed)) {
        laundryItems = parsed
          .filter(
            (it) =>
              it &&
              VALID_ITEM_TYPES.has(it.item_type) &&
              Number(it.quantity) > 0
          )
          .map((it) => ({
            item_type: String(it.item_type),
            quantity: Math.floor(Number(it.quantity)),
          }));
      }
    } catch {
      // ignore malformed payload, treated as no items below
    }

    if (laundryItems.length === 0) {
      return { error: "Please add at least one laundry item." };
    }
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      customer_id: userData.user.id,
      provider_id: providerId,
      category_id: categoryId,
      address,
      notes: notes || null,
      is_instant: isInstant,
      scheduled_at: isInstant ? null : new Date(scheduledAt).toISOString(),
      price_estimate: priceEstimate,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  if (laundryItems.length > 0) {
    const { error: itemsError } = await supabase.from("booking_items").insert(
      laundryItems.map((it) => ({
        booking_id: booking.id,
        item_type: it.item_type,
        quantity: it.quantity,
      }))
    );
    if (itemsError) {
      return { error: itemsError.message };
    }
  }

  revalidatePath("/bookings");
  redirect(`/bookings/${booking.id}`);
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login");
  }

  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("customer_id", userData.user.id);

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/bookings");
}
