import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookingForm from "@/components/BookingForm";

export default async function BookProviderPage({
  params,
  searchParams,
}: {
  params: Promise<{ providerId: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { providerId } = await params;
  const { category: categoryId } = await searchParams;
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    redirect(`/login?next=/book/${providerId}`);
  }

  const { data: provider } = await supabase
    .from("providers")
    .select("id, full_name, bio, starting_price, category_id")
    .eq("id", providerId)
    .single();

  if (!provider) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← Back
      </Link>
      <h1 className="text-2xl font-bold mt-2">Book {provider.full_name}</h1>
      {provider.bio && (
        <p className="text-neutral-500 text-sm mt-1">{provider.bio}</p>
      )}

      <div className="mt-6">
        <BookingForm
          providerId={provider.id}
          categoryId={categoryId ?? provider.category_id}
          priceEstimate={provider.starting_price}
        />
      </div>
    </div>
  );
}
