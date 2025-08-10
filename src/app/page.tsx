"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryChips } from "@/components/CategoryChips";
import { Row } from "@/components/Row";
import type { SiteItem } from "@/lib/site";

type Category = {
  slug: string;
  title: string;
};

function HomePageContent() {
  const searchParams = useSearchParams();
  const categoria = searchParams.get("categoria");
  const [query, setQuery] = useState("");
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      try {
        // Buscar sites
        const sitesRes = await fetch("/api/sites", { cache: "no-store" });
        if (sitesRes.ok) setSites(await sitesRes.json());

        // Buscar categorias
        const categoriesRes = await fetch("/api/categories", { cache: "no-store" });
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const results = useMemo(() => {
    let filteredSites = sites;
    
    // Filtrar por categoria se especificada
    if (categoria) {
      filteredSites = sites.filter((s) => (s.categories || []).includes(categoria));
    }
    
    // Filtrar por busca
    const q = query.trim().toLowerCase();
    if (!q) return filteredSites;
    
    return filteredSites.filter((s) => 
      [s.name, s.short_desc || "", s.slug].some((v) => v?.toLowerCase().includes(q))
    );
  }, [query, sites, categoria]);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-medium tracking-tight">Avaliando os melhores sites de relacionamentos</h2>
      </div>
      <div className="flex flex-col gap-4">
        <input
          type="search"
          placeholder="Buscar plataformas"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-neutral-200 bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
          aria-label="Buscar"
        />
        <CategoryChips categories={categories} />
      </div>

      {query && results.length > 0 && <Row title="Resultados" sites={results} />}

      {!query && !categoria && categories.map((c) => (
        <Row key={c.slug} title={c.title} sites={sites.filter((s) => (s.categories || []).includes(c.slug))} />
      ))}

      {!query && categoria && (
        <Row 
          title={categories.find(c => c.slug === categoria)?.title || categoria} 
          sites={results} 
        />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-medium tracking-tight">Avaliando os melhores sites de relacionamentos</h2>
        </div>
        <div className="flex flex-col gap-4">
          <input
            type="search"
            placeholder="Buscar plataformas"
            className="w-full rounded-md border border-neutral-200 bg-white px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-400"
            aria-label="Buscar"
            disabled
          />
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 rounded-full text-sm border bg-gray-100 text-gray-400">Carregando...</div>
          </div>
        </div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
