import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteAccount, signOut } from "@/app/actions";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect("/login?next=/account");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", userData.user.id)
    .single();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>

      <div className="card p-4 mb-6">
        <div className="text-sm text-neutral-500">Name</div>
        <div className="font-medium mb-3">{profile?.full_name ?? "—"}</div>
        <div className="text-sm text-neutral-500">Mobile number</div>
        <div className="font-medium">{profile?.phone ?? "—"}</div>
      </div>

      <form action={signOut} className="mb-8">
        <button type="submit" className="btn-outline !py-2 !px-3 text-sm">
          Sign out
        </button>
      </form>

      <div className="card p-4 border-red-200">
        <h2 className="font-semibold text-red-700 mb-1">Delete account</h2>
        <p className="text-sm text-neutral-600 mb-3">
          This permanently removes your name, phone number, and address from
          our records and disables your login. Your past order records are
          kept in anonymized form for accounting purposes. This cannot be
          undone.
        </p>
        <details>
          <summary className="cursor-pointer text-sm font-medium text-red-700 underline">
            Delete my account
          </summary>
          <form action={deleteAccount} className="mt-3">
            <button
              type="submit"
              className="rounded-md bg-red-700 text-white text-sm font-semibold py-2 px-3 hover:bg-red-800"
            >
              Yes, permanently delete my account
            </button>
          </form>
        </details>
      </div>

      <p className="text-xs text-neutral-400 mt-6">
        You can also request deletion without logging in at{" "}
        <Link href="/delete-account" className="underline">
          /delete-account
        </Link>
        .
      </p>
    </div>
  );
}
