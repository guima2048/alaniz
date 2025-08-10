"use client";
import { useEffect, useMemo, useState } from "react";
import { CategoryChips } from "@/components/CategoryChips";
import { Row } from "@/components/Row";
import { categories, type SiteItem } from "@/lib/site";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [sites, setSites] = useState<SiteItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/sites", { cache: "no-store" });
        if (res.ok) setSites(await res.json());
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as SiteItem[];
    return sites.filter((s) => [s.name, s.short_desc || "", s.slug].some((v) => v?.toLowerCase().includes(q)));
  }, [query, sites]);

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
        <CategoryChips />
      </div>

      {query && results.length > 0 && <Row title="Resultados" sites={results} />}

      {categories.map((c) => (
        <Row key={c.slug} title={c.title} sites={sites.filter((s) => (s.categories || []).includes(c.slug))} />
      ))}
    </div>
  );
}
