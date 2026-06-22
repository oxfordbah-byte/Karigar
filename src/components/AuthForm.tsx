"use client";

import { useActionState } from "react";
import type { ActionResult } from "@/app/actions";

type Mode = "login" | "signup";

export default function AuthForm({
  mode,
  action,
}: {
  mode: Mode;
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Full name</label>
            <input
              name="full_name"
              required
              className="input"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              type="tel"
              required
              className="input"
              placeholder="+92 3xx xxxxxxx"
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          className="input"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="input"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 border border-red-200 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending
          ? "Please wait…"
          : mode === "login"
          ? "Log in"
          : "Create account"}
      </button>
    </form>
  );
}
