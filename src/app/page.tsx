import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, description")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <section className="bg-black text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Trusted Home Services, Booked in Minutes
          </h1>
          <p className="mt-3 text-neutral-300 max-w-xl mx-auto">
            Verified professionals for cleaning, plumbing, electrical,
            carpentry, and more — delivered straight to your door.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-lg font-bold mb-4">Browse services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(categories ?? []).map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="card p-4 hover:border-black transition-colors"
            >
              <div className="font-semibold">{cat.name}</div>
              {cat.description && (
                <div className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {cat.description}
                </div>
              )}
            </Link>
          ))}
          {(!categories || categories.length === 0) && (
            <p className="text-neutral-500 col-span-full">
              No service categories yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
