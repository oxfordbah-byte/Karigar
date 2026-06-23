import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { signUp } from "@/app/actions";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Create your account</h1>
      <p className="text-neutral-500 text-sm mb-6">
        Sign up to book trusted home service professionals near you.
      </p>
      <AuthForm mode="signup" action={signUp} />
      <p className="text-sm text-neutral-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#d21f3c] underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
