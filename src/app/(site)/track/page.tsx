"use client";

import { useActionState } from "react";
import Link from "next/link";
import { trackBooking, type TrackActionResult } from "@/app/actions";
import StatusBadge from "@/components/StatusBadge";

export default function TrackPage() {
  const [state, formAction, pending] = useActionState<
    TrackActionResult,
    FormData
  >(trackBooking, {});

  const result = state?.result;

  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Track your order</h1>
      <p className="text-neutral-500 text-sm mb-6">
        No account needed — enter the tracking code from your booking
        confirmation along with your mobile number.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Tracking code
          </label>
          <input
            type="text"
            name="code"
            required
            className="input uppercase"
            placeholder="e.g. CV9Y2DS"
            maxLength={7}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Mobile number
          </label>
          <input
            type="tel"
            name="phone"
            required
            className="input"
            placeholder="10-digit mobile number"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? "Checking…" : "Check status"}
        </button>
      </form>

      {result && (
        <div className="card p-4 mt-6 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{result.category_name}</span>
            <StatusBadge status={result.status} />
          </div>
          <div>
            <span className="text-neutral-500">Provider: </span>
            {result.provider_name}
          </div>
          <div>
            <span className="text-neutral-500">Timing: </span>
            {result.is_instant
              ? "As soon as possible"
              : result.scheduled_at &&
                new Date(result.scheduled_at).toLocaleString()}
          </div>
          {result.price_estimate != null && (
            <div>
              <span className="text-neutral-500">Total: </span>₹
              {result.price_estimate}
            </div>
          )}
          <div>
            <span className="text-neutral-500">Payment: </span>
            {result.payment_method === "cod" ? "Cash on Delivery" : "Online"}
            {" · "}
            {result.payment_status === "paid" ? "Paid" : "Pending"}
          </div>
          <div>
            <span className="text-neutral-500">Booked on: </span>
            {new Date(result.created_at).toLocaleString()}
          </div>
          {result.delivered_at && (
            <div>
              <span className="text-neutral-500">Delivered: </span>
              {new Date(result.delivered_at).toLocaleString()}
            </div>
          )}
        </div>
      )}

      <p className="text-sm text-neutral-500 mt-6">
        Have an account?{" "}
        <Link href="/login" className="font-semibold text-[#d21f3c] underline">
          Log in
        </Link>{" "}
        instead for your full booking history.
      </p>
    </div>
  );
}
