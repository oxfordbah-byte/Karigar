import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Karigar",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 prose-sm">
      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-neutral-500 mb-6">Last updated: 25 June 2026</p>

      <p className="text-neutral-700 mb-4">
        Karigar (&quot;we&quot;, &quot;us&quot;) operates the Karigar home
        services booking app, based in Kerala, India. This policy explains
        what information we collect, how we use it, and your rights.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Information we collect</h2>
      <p className="text-neutral-700 mb-2">
        When you create an account and book a service, we collect: your name,
        mobile number, service address, and details of the bookings you make
        (service type, items, schedule, price, payment method, and your
        rating/review of completed orders). We do not collect or store card or
        bank details — payment is currently cash on delivery only.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">How we use it</h2>
      <p className="text-neutral-700 mb-2">
        We use this information to create your account, process and assign
        your bookings to a service provider, contact you about your orders,
        and improve our service. We do not sell your data, and we do not use
        it for advertising.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Who we share it with</h2>
      <p className="text-neutral-700 mb-2">
        Your booking details (name, phone number, address) are shared with
        the service provider assigned to your booking, so they can complete
        the job. We use Supabase for secure data storage and login, and
        Vercel for app hosting. We do not share your data with advertisers or
        data brokers.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Data retention &amp; deletion</h2>
      <p className="text-neutral-700 mb-2">
        You can delete your account at any time from{" "}
        <Link href="/account" className="underline font-medium">My Account</Link>{" "}
        or via our{" "}
        <Link href="/delete-account" className="underline font-medium">
          account deletion page
        </Link>
        . Deleting your account permanently removes your name, phone number,
        and address, and disables your login immediately. We retain
        anonymized records of past orders (with personal details removed)
        for accounting and legal recordkeeping.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Security</h2>
      <p className="text-neutral-700 mb-2">
        Your data is encrypted in transit (HTTPS) and at rest. Access to
        booking records is restricted so that customers and providers can
        only see their own bookings.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Your rights</h2>
      <p className="text-neutral-700 mb-2">
        You can access, correct, or delete your personal data at any time
        through the app, or by contacting customer care below.
      </p>

      <h2 className="font-semibold text-lg mt-6 mb-2">Contact us</h2>
      <p className="text-neutral-700 mb-2">
        Phone:{" "}
        <a href="tel:+919876543210" className="font-semibold text-[#d21f3c]">
          +91 98765 43210
        </a>
      </p>
    </div>
  );
}
