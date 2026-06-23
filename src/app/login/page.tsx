import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signIn } from "@/app/actions";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Log in</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Welcome back. Log in to book services and track your bookings.
      </p>
      <AuthForm mode="login" action={signIn} />
      <p className="text-sm text-neutral-500 mt-4">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-[#d21f3c] underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
