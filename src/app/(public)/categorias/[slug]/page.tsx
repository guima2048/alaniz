import { notFound } from "next/navigation";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";
import { CardImage } from "@/components/OptimizedImage";

type Params = {
  slug: string;
};

type SiteItem = {
  slug: string;
  name: string;
  cover: string;
  short_desc: string;
  categories?: string[];
};

type CategoryItem = {
  slug: string;
  title: string;
  description?: string;
};

export async function generateStaticParams() {
  const file = getDataFilePath("categories.json");
  const categories = await readJsonFile<CategoryItem[]>(file, []);
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  
  const sitesFile = getDataFilePath("sites.json");
  const catsFile = getDataFilePath("categories.json");
  
  const allSites = await readJsonFile<SiteItem[]>(sitesFile, []);
  const categories = await readJsonFile<CategoryItem[]>(catsFile, []);
  
  const category = categories.find((c) => c.slug === slug);
  const sites = allSites.filter((s) => s.categories?.includes(slug));

  if (!category) {
    notFound();
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
                  <CardImage 
                    src={s.cover} 
                    alt={s.name} 
                    className="h-40 w-full" 
                  />
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

