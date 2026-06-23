"use client";

import { useActionState, useState } from "react";
import { createBooking, type ActionResult } from "@/app/actions";

const ITEM_TYPES: { value: string; label: string }[] = [
  { value: "clothes", label: "Clothes" },
  { value: "shoes", label: "Shoes" },
  { value: "curtains", label: "Curtains" },
  { value: "bedsheets", label: "Bedsheets" },
  { value: "blankets", label: "Blankets" },
  { value: "other", label: "Other" },
];

type LaundryItem = { item_type: string; quantity: number };

export default function BookingForm({
  providerId,
  categoryId,
  categorySlug,
  priceEstimate,
}: {
  providerId: string;
  categoryId: string;
  categorySlug?: string | null;
  priceEstimate?: number | null;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createBooking,
    {}
  );
  const [timing, setTiming] = useState<"instant" | "scheduled">("instant");
  const isLaundry = categorySlug === "laundry-ironing";
  const [items, setItems] = useState<LaundryItem[]>([
    { item_type: "clothes", quantity: 1 },
  ]);

  function updateItem(index: number, patch: Partial<LaundryItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, ...patch } : it))
    );
  }

  function addItemRow() {
    setItems((prev) => [...prev, { item_type: "clothes", quantity: 1 }]);
  }

  function removeItemRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="provider_id" value={providerId} />
      <input type="hidden" name="category_id" value={categoryId} />
      {priceEstimate ? (
        <input type="hidden" name="price_estimate" value={priceEstimate} />
      ) : null}
      {isLaundry && (
        <input type="hidden" name="laundry_items" value={JSON.stringify(items)} />
      )}

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
        <input type="hidden" name="timing" value={timing} />
      </div>

      {timing === "scheduled" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Date & time
          </label>
          <input
            type="datetime-local"
            name="scheduled_at"
            required={timing === "scheduled"}
            className="input"
          />
        </div>
      )}

      {isLaundry && (
        <div>
          <label className="block text-sm font-medium mb-1">
            What needs washing?
          </label>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <select
                  className="input"
                  value={item.item_type}
                  onChange={(e) =>
                    updateItem(i, { item_type: e.target.value })
                  }
                >
                  {ITEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  className="input w-20 shrink-0"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(i, {
                      quantity: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItemRow(i)}
                    className="text-neutral-400 hover:text-[#d21f3c] text-sm shrink-0"
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItemRow}
            className="text-sm font-semibold text-[#d21f3c] mt-2 hover:underline"
          >
            + Add another item
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          Service address
        </label>
        <textarea
          name="address"
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
          name="notes"
          rows={2}
          className="input"
          placeholder="Describe the issue or task in a few words"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Booking…" : "Confirm booking"}
      </button>
    </form>
  );
}
