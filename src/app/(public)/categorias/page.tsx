import Link from "next/link";
import { categories } from "@/lib/site";

export default function CategoriesIndexPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Categorias</h1>
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
    </div>
  );
}






