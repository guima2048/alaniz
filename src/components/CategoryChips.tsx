import Link from "next/link";

type Category = {
  slug: string;
  title: string;
};

type Props = {
  categories?: Category[];
};

export function CategoryChips({ categories = [] }: Props) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/"
        className="px-3 py-1 rounded-full text-sm border bg-neutral-900 text-white border-neutral-900"
      >
        Todas
      </Link>
      {categories.slice(0, 5).map((c) => (
        <Link
          key={c.slug}
          href={`/?categoria=${encodeURIComponent(c.slug)}`}
          className="px-3 py-1 rounded-full text-sm border bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 transition-colors"
        >
          {c.title}
        </Link>
      ))}
    </div>
  );
}

