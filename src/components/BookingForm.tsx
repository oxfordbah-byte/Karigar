"use client";

import { useActionState, useState } from "react";
import { createBooking, type ActionResult } from "@/app/actions";

const ITEM_TYPES: { value: string; label: string }[] = [
  { value: "shirt", label: "Shirt" },
  { value: "pant", label: "Pant / Trouser" },
  { value: "kurta", label: "Kurta / Shalwar Kameez" },
  { value: "saree", label: "Saree" },
  { value: "jacket", label: "Jacket / Coat" },
  { value: "bedsheet", label: "Bedsheet" },
  { value: "blanket", label: "Blanket / Quilt" },
  { value: "curtain", label: "Curtain" },
  { value: "shoe", label: "Shoes" },
  { value: "towel", label: "Towel" },
  { value: "other", label: "Other" },
];

export default function BookingForm({
  providerId,
  categoryId,
  categorySlug,
  priceEstimate,
  itemPrices,
}: {
  providerId: string;
  categoryId: string;
  categorySlug?: string | null;
  priceEstimate?: number | null;
  itemPrices?: Record<string, number>;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createBooking,
    {}
  );
  const [timing, setTiming] = useState<"instant" | "scheduled">("instant");
  const isLaundry = categorySlug === "laundry-ironing";
  const [step, setStep] = useState<"details" | "review">("details");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  const prices = itemPrices ?? {};

  function setQty(itemType: string, qty: number) {
    setQuantities((prev) => ({ ...prev, [itemType]: Math.max(0, qty) }));
  }

  const selectedItems = ITEM_TYPES.map((t) => ({
    ...t,
    quantity: quantities[t.value] ?? 0,
  })).filter((t) => t.quantity > 0);

  const total = selectedItems.reduce(
    (sum, it) => sum + (prices[it.value] ?? 0) * it.quantity,
    0
  );
  const totalPieces = selectedItems.reduce((n, it) => n + it.quantity, 0);

  function goToReview() {
    if (!address.trim()) {
      setFormError("Address is required.");
      return;
    }
    if (isLaundry && selectedItems.length === 0) {
      setFormError("Please add at least one laundry item.");
      return;
    }
    if (timing === "scheduled" && !scheduledAt) {
      setFormError("Please choose a date & time for scheduled booking.");
      return;
    }
    setFormError(null);
    setStep("review");
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="provider_id" value={providerId} />
      <input type="hidden" name="category_id" value={categoryId} />
      <input type="hidden" name="payment_method" value="cod" />
      <input type="hidden" name="timing" value={timing} />
      {timing === "scheduled" && (
        <input type="hidden" name="scheduled_at" value={scheduledAt} />
      )}
      <input type="hidden" name="address" value={address} />
      <input type="hidden" name="notes" value={notes} />
      {isLaundry && (
        <input
          type="hidden"
          name="laundry_items"
          value={JSON.stringify(
            selectedItems.map((it) => ({
              item_type: it.value,
              quantity: it.quantity,
            }))
          )}
        />
      )}
      {(isLaundry ? total > 0 : !!priceEstimate) && (
        <input
          type="hidden"
          name="price_estimate"
          value={isLaundry ? total : priceEstimate ?? ""}
        />
      )}

      {step === "details" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">When?</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTiming("instant")}
                className={timing === "instant" ? "btn-primary" : "btn-outline"}
              >
                As soon as possible
              </button>
              <button
                type="button"
                onClick={() => setTiming("scheduled")}
                className={timing === "scheduled" ? "btn-primary" : "btn-outline"}
              >
                Schedule for later
              </button>
            </div>
          </div>

          {timing === "scheduled" && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="input"
              />
            </div>
          )}

          {isLaundry && (
            <div>
              <div className="space-y-2">
                {ITEM_TYPES.map((t) => {
                  const qty = quantities[t.value] ?? 0;
                  const lineTotal = (prices[t.value] ?? 0) * qty;
                  return (
                    <div
                      key={t.value}
                      className="flex items-center justify-between gap-2 card px-3 py-2"
                    >
                      <div>
                        <div className="text-sm font-medium">{t.label}</div>
                        <div className="text-xs text-neutral-400">
                          ₹{prices[t.value] ?? 0} / piece
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setQty(t.value, qty - 1)}
                            className="w-7 h-7 rounded-full border border-[#e7c3c8] text-[#d21f3c] font-bold flex items-center justify-center shrink-0"
                            aria-label={`Decrease ${t.label}`}
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm">{qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(t.value, qty + 1)}
                            className="w-7 h-7 rounded-full border border-[#e7c3c8] text-[#d21f3c] font-bold flex items-center justify-center shrink-0"
                            aria-label={`Increase ${t.label}`}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-neutral-500 w-16 text-right shrink-0">
                          {qty > 0 ? `₹${lineTotal}` : ""}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {selectedItems.length > 0 && (
                <div className="flex items-center justify-between mt-3 px-1 font-semibold text-sm">
                  <span>Total ({totalPieces} items)</span>
                  <span className="text-[#d21f3c]">₹{total}</span>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Service address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={2}
              className="input"
              placeholder="House #, street, area, city"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="input"
              placeholder="Describe the issue or task in a few words"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <button
            type="button"
            onClick={goToReview}
            className="btn-primary w-full"
          >
            Review order
          </button>
        </div>
      )}

      {step === "review" && (
        <div className="space-y-4">
          <div className="card p-4 space-y-2 text-sm">
            <div className="font-semibold mb-1">Review your order</div>

            {isLaundry && selectedItems.length > 0 && (
              <div className="space-y-1">
                {selectedItems.map((it) => (
                  <div key={it.value} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.label}
                    </span>
                    <span>₹{(prices[it.value] ?? 0) * it.quantity}</span>
                  </div>
                ))}
                <div className="border-t border-[#f0d8db] pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-[#d21f3c]">₹{total}</span>
                </div>
              </div>
            )}

            {!isLaundry && priceEstimate ? (
              <div className="flex justify-between font-semibold">
                <span>Estimated price</span>
                <span className="text-[#d21f3c]">₹{priceEstimate}</span>
              </div>
            ) : null}

            <div className="pt-2 text-neutral-500 space-y-0.5">
              <div>Address: {address}</div>
              <div>
                Timing:{" "}
                {timing === "instant"
                  ? "As soon as possible"
                  : scheduledAt && new Date(scheduledAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment</label>
            <div className="space-y-2">
              <div className="card px-3 py-2 flex items-center justify-between border-[#d21f3c]">
                <span className="text-sm font-medium">Cash on Delivery</span>
                <span
                  className="badge-soon"
                  style={{ background: "#16a34a" }}
                >
                  Selected
                </span>
              </div>
              <div className="card px-3 py-2 flex items-center justify-between opacity-50">
                <span className="text-sm">
                  Online payment (card / JazzCash / EasyPaisa)
                </span>
                <span className="badge-soon">Coming soon</span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Pay the delivery person in cash when your laundry is dropped
              back.
            </p>
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
              {state.error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep("details")}
              className="btn-outline flex-1"
            >
              ← Edit
            </button>
            <button
              type="submit"
              disabled={pending}
              className="btn-primary flex-1"
            >
              {pending ? "Booking…" : "Confirm & Book"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
