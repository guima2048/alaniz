"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

  if (categories.length === 0) {
    return null;
  }

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
      {categories.map((c) => (
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
    </div>
  );
}

