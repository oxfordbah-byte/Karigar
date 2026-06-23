import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CategoryIcon from "@/components/CategoryIcon";

export default async function Home() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("service_categories")
    .select("id, name, slug, description, coming_soon")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div>
      <section className="bg-[#d21f3c] text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Laundry Wash & Ironing, Picked Up & Dropped Off
          </h1>
          <p className="mt-3 text-white/90 max-w-xl mx-auto">
            We collect your clothes, shoes, curtains, bedsheets & blankets,
            wash and iron them, and bring them right back to your door.
            More home services are on the way.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-lg font-bold mb-4">Browse services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(categories ?? []).map((cat) =>
            cat.coming_soon ? (
              <div
                key={cat.id}
                className="card p-4 flex flex-col items-start gap-2 opacity-60 cursor-not-allowed select-none"
              >
                <div className="flex items-center justify-between w-full">
                  <CategoryIcon
                    slug={cat.slug}
                    className="w-9 h-9 text-neutral-400"
                  />
                  <span className="badge-soon">Coming Soon</span>
                </div>
                <div className="font-semibold text-neutral-500">{cat.name}</div>
                {cat.description && (
                  <div className="text-xs text-neutral-400 line-clamp-2">
                    {cat.description}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="card p-4 flex flex-col items-start gap-2 border-[#d21f3c] hover:shadow-md transition-shadow"
              >
                <CategoryIcon slug={cat.slug} className="w-9 h-9 text-[#d21f3c]" />
                <div className="font-semibold">{cat.name}</div>
                {cat.description && (
                  <div className="text-xs text-neutral-500 line-clamp-3">
                    {cat.description}
                  </div>
                )}
                <span className="text-xs font-semibold text-[#d21f3c] mt-1">
                  Book now →
                </span>
              </Link>
            )
          )}
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
