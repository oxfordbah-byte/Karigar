"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { error?: string };

// Karigar uses mobile-number login instead of email. Supabase Auth's
// password-based flow still needs an "email" under the hood, so we derive a
// stable, hidden one from the normalized Indian mobile number. The real
// phone number (e.g. "+919876543210") is kept in user_metadata for display.
function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let national: string;
  if (digits.length === 12 && digits.startsWith("91")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return null;
  }
  if (!/^[6-9]\d{9}$/.test(national)) return null;
  return national;
}

function phoneToAuthEmail(nationalNumber: string): string {
  return `91${nationalNumber}@phone.karigar.app`;
}

export async function signUp(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();

  const fullName = String(formData.get("full_name") || "");
  const phoneRaw = String(formData.get("phone") || "");
  const password = String(formData.get("password") || "");

  const national = normalizeIndianPhone(phoneRaw);
  if (!national) {
    return { error: "Enter a valid 10-digit Indian mobile number." };
  }
  const authEmail = phoneToAuthEmail(national);
  const displayPhone = `+91${national}`;

  const { error } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: { full_name: fullName, phone: displayPhone },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return {
        error: "This mobile number is already registered. Try logging in instead.",
      };
    }
    return { error: error.message };
  }

  redirect("/");
}

export async function signIn(
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
  const authEmail = phoneToAuthEmail(national);

  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) {
    return { error: "Incorrect mobile number or password." };
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
