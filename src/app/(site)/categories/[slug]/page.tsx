import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("service_categories")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) {
    notFound();
  }

  const { data: providers } = await supabase
    .from("providers")
    .select("id, full_name, bio, starting_price, rating, jobs_completed")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .eq("is_verified", true)
    .order("rating", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-neutral-500 hover:underline">
        ← All services
      </Link>
      <h1 className="text-2xl font-bold mt-2">{category.name}</h1>
      {category.description && (
        <p className="text-neutral-500 mt-1">{category.description}</p>
      )}

      <div className="mt-6 space-y-3">
        {(providers ?? []).map((p) => (
          <div
            key={p.id}
            className="card p-4 flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-semibold flex items-center gap-2">
                {p.full_name}
                <span className="text-xs font-normal text-neutral-500">
                  ★ {p.rating} · {p.jobs_completed} jobs
                </span>
              </div>
              {p.bio && (
                <div className="text-sm text-neutral-500 mt-1">{p.bio}</div>
              )}
              {p.starting_price && (
                <div className="text-sm font-medium mt-1">
                  Starting at ₹{p.starting_price}
                </div>
              )}
            </div>
            <Link
              href={`/book/${p.id}?category=${category.id}`}
              className="btn-primary shrink-0"
            >
              Book
            </Link>
          </div>
        ))}
        {(!providers || providers.length === 0) && (
          <p className="text-neutral-500">
            No verified providers available in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
