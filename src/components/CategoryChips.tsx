"use client";
import Link from "next/link";
import { categories } from "@/lib/site";

export function CategoryChips() {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/categorias/${c.slug}`}
          className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm hover:shadow-sm text-neutral-800"
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}

