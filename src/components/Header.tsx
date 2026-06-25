import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/actions";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="sticky top-0 z-20 bg-white border-b-2 border-[#d21f3c]">
      <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-extrabold tracking-tight text-[#d21f3c]">
          KARIGAR
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:underline">Services</Link>
          {user ? (
            <>
              <Link href="/bookings" className="hover:underline">My Bookings</Link>
              <Link href="/account" className="hover:underline">Account</Link>
              <form action={signOut}>
                <button type="submit" className="btn-outline !py-2 !px-3 text-sm">Sign out</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Log in</Link>
              <Link href="/signup" className="btn-primary !py-2 !px-3 text-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
