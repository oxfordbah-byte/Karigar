"use client";

import { useActionState, useState } from "react";
import { createBooking, type ActionResult } from "@/app/actions";

export default function BookingForm({
  providerId,
  categoryId,
  priceEstimate,
}: {
  providerId: string;
  categoryId: string;
  priceEstimate?: number | null;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    createBooking,
    {}
  );
  const [timing, setTiming] = useState<"instant" | "scheduled">("instant");

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="provider_id" value={providerId} />
      <input type="hidden" name="category_id" value={categoryId} />
      {priceEstimate ? (
        <input type="hidden" name="price_estimate" value={priceEstimate} />
      ) : null}

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
