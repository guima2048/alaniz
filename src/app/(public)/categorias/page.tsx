import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Category = {
  slug: string;
  title: string;
};

export default async function CategoriesIndexPage() {
  const supabase = getSupabase();
  let categories: Category[] = [];

  if (supabase) {
    // Usar Supabase
    const { data, error } = await supabase
      .from('categories')
      .select('slug, title')
      .order('title', { ascending: true });
    
    if (!error && data) {
      categories = data;
    }
  } else {
    // Fallback para arquivo local
    const cats = await import("@/data/categories.json");
    categories = cats.default;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Categorias</h1>
      {categories.length === 0 ? (
        <p>Nenhuma categoria encontrada.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <li key={c.slug} className="rounded-lg border border-neutral-200 bg-white shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-sm text-neutral-600">/{c.slug}</div>
                </div>
                <Link href={`/categorias/${c.slug}`} className="text-sm underline">
                  Ver lista
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}






