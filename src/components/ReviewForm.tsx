"use client";

import { useActionState, useState } from "react";
import { submitReview, type ActionResult } from "@/app/actions";

export default function ReviewForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    submitReview,
    {}
  );
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.success) {
    return (
      <div className="card p-4 mt-6 text-center">
        <p className="font-semibold">Thanks for your feedback!</p>
        <p className="text-sm text-neutral-500">Your review has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="card p-4 mt-6">
      <h2 className="font-semibold mb-2">Rate this service</h2>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="booking_id" value={bookingId} />
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              className="text-2xl leading-none"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <span className={(hover || rating) >= n ? "text-[#d21f3c]" : "text-neutral-300"}>
                ★
              </span>
            </button>
          ))}
        </div>
        <textarea
          name="comment"
          rows={3}
          className="input"
          placeholder="Optional: tell us how it went"
        />
        {state.error && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending || rating === 0} className="btn-primary">
          {pending ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </div>
  );
}
