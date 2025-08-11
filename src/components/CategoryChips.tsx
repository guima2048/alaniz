"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type Category = {
  slug: string;
  title: string;
};

type Props = {
  categories?: Category[];
};

export function CategoryChips({ categories = [] }: Props) {
  const searchParams = useSearchParams();
  const current = searchParams.get("categoria");
  const [isExpanded, setIsExpanded] = useState(false);

  if (categories.length === 0) {
    return null;
  }

  // Mostrar apenas a primeira categoria quando não expandido
  const visibleCategories = isExpanded ? categories : categories.slice(0, 1);
  const hasMoreCategories = categories.length > 1;

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
          !current
            ? "bg-neutral-900 text-white border-neutral-900"
            : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"
        }`}
      >
        Todas
      </Link>
      {visibleCategories.map((c) => (
        <Link
          key={c.slug}
          href={`/?categoria=${encodeURIComponent(c.slug)}`}
          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
            current === c.slug
              ? "bg-neutral-900 text-white border-neutral-900"
              : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400"
          }`}
        >
          {c.title}
        </Link>
      ))}
      {hasMoreCategories && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="px-3 py-1 rounded-full text-sm border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 transition-colors flex items-center gap-1"
        >
          <span>Mais</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {hasMoreCategories && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="px-3 py-1 rounded-full text-sm border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 transition-colors flex items-center gap-1"
        >
          <span>Menos</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

