import Link from "next/link";

export default function DeleteAccountInfoPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Delete your Karigar account</h1>

      {searchParams.error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm p-3">
          Something went wrong deleting your account. Please try again, or
          contact us using the details below.
        </div>
      )}

      <p className="text-neutral-700 mb-4">
        You can request deletion of your Karigar account and personal data at
        any time, whether or not you have the app installed.
      </p>

      <h2 className="font-semibold mt-6 mb-2">Option 1: Delete it yourself (instant)</h2>
      <p className="text-neutral-700 mb-2">
        Log in to your account, go to{" "}
        <Link href="/account" className="underline font-medium">
          My Account
        </Link>
        , and choose &quot;Delete my account&quot;. This takes effect
        immediately.
      </p>

      <h2 className="font-semibold mt-6 mb-2">Option 2: Request deletion without logging in</h2>
      <p className="text-neutral-700 mb-2">
        Call or message our customer care team and ask us to delete your
        account:
      </p>
      <p className="text-neutral-700 mb-2">
        Phone:{" "}
        <a href="tel:+919876543210" className="font-semibold text-[#d21f3c]">
          +91 98765 43210
        </a>
      </p>
      <p className="text-neutral-700 mb-6">
        We&apos;ll verify your mobile number and complete the request within
        7 days.
      </p>

      <h2 className="font-semibold mt-6 mb-2">What gets deleted</h2>
      <p className="text-neutral-700 mb-2">
        Your name, phone number, and address are permanently removed and your
        login is disabled immediately. Records of past orders are kept in an
        anonymized form (no longer linked to your identity) for accounting
        and legal purposes, as described in our{" "}
        <Link href="/privacy" className="underline font-medium">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
