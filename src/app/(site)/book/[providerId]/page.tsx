import Link from "next/link";
import { notFound } from "next/navigation";
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
  const isGuest = !userData.user;

  const { data: provider } = await supabase
    .from("providers")
    .select("id, full_name, bio, starting_price, category_id")
    .eq("id", providerId)
    .single();

  if (!provider) {
    notFound();
  }

  const resolvedCategoryId = categoryId ?? provider.category_id;

  const { data: category } = await supabase
    .from("service_categories")
    .select("slug")
    .eq("id", resolvedCategoryId)
    .single();

  let itemPrices: Record<string, number> = {};
  if (category?.slug === "laundry-ironing") {
    const { data: prices } = await supabase
      .from("laundry_item_prices")
      .select("item_type, price_pkr");
    itemPrices = Object.fromEntries(
      (prices ?? []).map((p) => [p.item_type, p.price_pkr])
    );
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
          categoryId={resolvedCategoryId}
          categorySlug={category?.slug ?? null}
          priceEstimate={provider.starting_price}
          itemPrices={itemPrices}
          isGuest={isGuest}
        />
      </div>
    </div>
  );
}
