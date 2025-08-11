import { getSupabase } from "@/lib/supabase";
import { getBaseUrl } from "@/lib/url";
import { siteTitle } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import type { SiteItem } from "@/lib/site";

type Params = { slug: string };

type Category = {
  slug: string;
  title: string;
};

export async function generateStaticParams() {
  const supabase = getSupabase();
  let categories: Category[] = [];

  if (supabase) {
    const { data } = await supabase
      .from('categories')
      .select('slug, title');
    if (data) categories = data;
  } else {
    const cats = await import("@/data/categories.json");
    categories = cats.default;
  }

  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  let category: Category | undefined;

  if (supabase) {
    const { data } = await supabase
      .from('categories')
      .select('slug, title')
      .eq('slug', slug)
      .single();
    if (data) category = data;
  } else {
    const cats = await import("@/data/categories.json");
    category = cats.default.find((c: Category) => c.slug === slug);
  }

  return {
    title: siteTitle(category ? category.title : "Categoria"),
    description: `Lista de sites em ${category?.title ?? "categoria"}.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const supabase = getSupabase();
  let category: Category | undefined;
  let sites: SiteItem[] = [];

  if (supabase) {
    // Buscar categoria
    const { data: catData } = await supabase
      .from('categories')
      .select('slug, title')
      .eq('slug', slug)
      .single();
    if (catData) category = catData;

    // Buscar sites da categoria
    const { data: sitesData } = await supabase
      .from('sites')
      .select('*');
    if (sitesData) {
      if (slug === 'todos') {
        sites = sitesData;
      } else {
        sites = sitesData.filter((s) => (s.categories || []).includes(slug));
      }
      // Ordenar por nota do público (rating_avg) em ordem decrescente
      sites = sites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    }
  } else {
    // Fallback para arquivo local
    const cats = await import("@/data/categories.json");
    category = cats.default.find((c: Category) => c.slug === slug);
    
    const res = await fetch(`${getBaseUrl()}/api/sites`, { cache: "no-store" });
    const allSites = (res.ok ? await res.json() : []) as SiteItem[];
    if (slug === 'todos') {
      sites = allSites;
    } else {
      sites = allSites.filter((s) => (s.categories || []).includes(slug));
    }
    // Ordenar por nota do público (rating_avg) em ordem decrescente
    sites = sites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">{category?.title ?? "Categoria"}</h1>
      {sites.length === 0 ? (
        <p className="text-neutral-700">Nenhum site nesta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((s) => (
            <div key={s.slug} className="max-w-[320px]">
              <div className="[&>*]:w-full">
                <a
                  href={`/${s.slug}`}
                  className="block rounded-lg overflow-hidden border border-neutral-200 bg-white shadow-sm hover:shadow"
                >
                  <Image src={s.cover} alt={s.name} width={640} height={360} className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <div className="font-medium">{s.name}</div>
                    <p className="text-sm text-neutral-600 line-clamp-2">{s.short_desc}</p>
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

