"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryChips } from "@/components/CategoryChips";
import { Row } from "@/components/Row";
import type { SiteItem } from "@/lib/site";

type Category = {
  slug: string;
  title: string;
  order?: number;
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
    if (categoria && categoria !== 'todos') {
      filteredSites = sites.filter((s) => (s.categories || []).includes(categoria));
    }
    // Se categoria for 'todos', mostrar todos os sites
    
    // Filtrar por busca
    const q = query.trim().toLowerCase();
    if (!q) {
      // Ordenar por nota do público (rating_avg) em ordem decrescente
      return filteredSites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
    }
    
    const searchResults = filteredSites.filter((s) => 
      [s.name, s.short_desc || "", s.slug].some((v) => v?.toLowerCase().includes(q))
    );
    
    // Ordenar resultados da busca por nota do público
    return searchResults.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
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

      {!query && !categoria && (
        <>
          {/* Mostrar "Todos os Sites" primeiro */}
          {(() => {
            const todosCategory = categories.find(c => c.slug === 'todos');
            if (todosCategory) {
              const todosSites = sites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
              return (
                <Row 
                  key="todos" 
                  title={todosCategory.title} 
                  sites={todosSites} 
                />
              );
            }
            return null;
          })()}
          
          {/* Mostrar outras categorias */}
          {categories
            .filter(c => c.slug !== 'todos')
            .map((c) => {
              const categorySites = sites.filter((s) => (s.categories || []).includes(c.slug));
              const sortedSites = categorySites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
              
              return (
                <Row 
                  key={c.slug} 
                  title={c.title} 
                  sites={sortedSites} 
                />
              );
            })}
        </>
      )}

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
