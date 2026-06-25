"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/actions";
import { workerSignIn } from "@/app/worker/actions";

export default function WorkerLoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    workerSignIn,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Mobile number</label>
        <input
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel"
          className="input"
          placeholder="+91 98xxx xxxxx"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input name="password" type="password" required minLength={6} className="input" placeholder="••••••••" />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Please wait…" : "Log in"}
      </button>
    </form>
  );
}
