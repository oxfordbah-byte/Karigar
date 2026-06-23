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
  "shirt",
  "pant",
  "kurta",
  "saree",
  "jacket",
  "bedsheet",
  "blanket",
  "curtain",
  "shoe",
  "towel",
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
  const clientPriceEstimate = formData.get("price_estimate")
    ? Number(formData.get("price_estimate"))
    : null;
  const laundryItemsRaw = formData.get("laundry_items");
  const paymentMethodRaw = String(formData.get("payment_method") || "cod");
  const paymentMethod = paymentMethodRaw === "online" ? "online" : "cod";

  if (paymentMethod === "online") {
    return { error: "Online payment isn't available yet — please use Cash on Delivery." };
  }

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

  // Recompute the total server-side from the authoritative price list —
  // never trust a client-submitted total.
  let priceEstimate = clientPriceEstimate;
  if (laundryItems.length > 0) {
    const { data: priceRows, error: priceError } = await supabase
      .from("laundry_item_prices")
      .select("item_type, price_pkr");
    if (priceError) {
      return { error: priceError.message };
    }
    const priceMap = new Map(
      (priceRows ?? []).map((p) => [p.item_type, p.price_pkr])
    );
    priceEstimate = laundryItems.reduce(
      (sum, it) => sum + (priceMap.get(it.item_type) ?? 0) * it.quantity,
      0
    );
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
      payment_method: paymentMethod,
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
