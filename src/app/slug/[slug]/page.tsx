import { notFound } from "next/navigation";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";
import { HeroImage } from "@/components/OptimizedImage";
import { VisitSiteButton } from "@/components/VisitSiteButton";
import { SiteRating } from "@/components/SiteRating";
import { RateForm } from "@/components/RateForm";
import { Comments } from "@/components/Comments";
import { MDXRemote } from "next-mdx-remote/rsc";
import fs from "node:fs";
import path from "node:path";

type SiteItem = {
  slug: string;
  name: string;
  url: string;
  hero?: string;
  short_desc?: string;
  features?: string[];
};

type Params = {
  slug: string;
};

export async function generateStaticParams() {
  const file = getDataFilePath("sites.json");
  const sites = await readJsonFile<SiteItem[]>(file, []);

  return sites.map((site) => ({
    slug: site.slug,
  }));
}

export default async function EditorialPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  
  const file = getDataFilePath("sites.json");
  const sites = await readJsonFile<SiteItem[]>(file, []);
  const site = sites.find((s) => s.slug === slug);

  if (!site) {
    notFound();
  }

  // Verificar se existe arquivo MDX
  const mdxPath = path.join(process.cwd(), "src/content/editoriais", `${slug}.mdx`);
  const hasMdx = fs.existsSync(mdxPath);

  const fallback = (
    <div>
      <p className="text-neutral-700 leading-relaxed">
        {site.short_desc || "Descrição em breve..."}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        {Boolean(site.hero) && (
          <div className="w-full">
            <HeroImage 
              src={site.hero as string} 
              alt={`Hero ${site.name}`} 
              className="w-full h-56 md:h-72 rounded" 
            />
            <div className="mt-4 flex items-center gap-4">
              <VisitSiteButton
                url={site.url}
                slug={site.slug}
                name={site.name}
                className="inline-flex items-center rounded-md bg-black text-white px-6 py-3 hover:bg-gray-800 font-medium text-lg"
              />
              <SiteRating slug={site.slug} />
            </div>
          </div>
        )}
        <h1 className="text-2xl font-semibold text-neutral-900">{site.name}</h1>
        <p className="text-neutral-800 max-w-2xl">{site.short_desc}</p>
        <div className="flex gap-2 flex-wrap text-sm text-neutral-600">
          {(site.features || []).map((f) => (
            <span key={f} className="rounded-full border border-neutral-300 px-2 py-0.5 bg-white text-neutral-800">
              {f}
            </span>
          ))}
        </div>

      </header>

      <section className="prose max-w-none">
        {hasMdx ? (
          <MDXRemote source={fs.readFileSync(mdxPath, "utf8") as string} />
        ) : (
          <div>
            {fallback}
            <div className="mt-4">
              <RateForm slug={site.slug} />
            </div>
          </div>
        )}
      </section>

      <Comments slug={site.slug} />
    </div>
  );
}
