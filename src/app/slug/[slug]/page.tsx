import { notFound } from "next/navigation";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";
import { MDXRemote } from "next-mdx-remote/rsc";
import { RateForm } from "@/components/RateForm";
import { Comments } from "@/components/Comments";
import { VisitSiteButton } from "@/components/VisitSiteButton";
import { HeroImage } from "@/components/OptimizedImage";
import fs from "node:fs";
import path from "node:path";

type Params = {
  slug: string;
};

type SiteItem = {
  slug: string;
  name: string;
  url: string;
  short_desc: string;
  features?: string[];
  hero?: string;
};

// Página dinâmica: novos sites aparecem sem rebuild
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditorialPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;

  // 1) Tenta Supabase
  const supabase = getSupabase();
  let site: SiteItem | null = null;
  if (supabase) {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (!error && data) {
      site = data as unknown as SiteItem;
    }
  }

  // 2) Fallback: arquivo local
  if (!site) {
    const file = getDataFilePath("sites.json");
    const sites = await readJsonFile<SiteItem[]>(file, []);
    site = sites.find((s) => s.slug === slug) || null;
  }

  if (!site) {
    notFound();
  }

  const mdxPath = path.join(process.cwd(), "src", "content", "editoriais", `${slug}.mdx`);
  const hasMdx = fs.existsSync(mdxPath);

  const fallback = (
    <div className="prose max-w-none">
      <h2>Sobre {site.name}</h2>
      <p>{site.short_desc}</p>
      <p>
        <a href={site.url} target="_blank" rel="noopener noreferrer">
          Visitar {site.name}
        </a>
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
        <div className="mt-2">
          <RateForm slug={site.slug} />
        </div>
      </header>

      <section className="prose max-w-none">
        {hasMdx ? (
          <MDXRemote source={fs.readFileSync(mdxPath, "utf8") as string} />
        ) : (
          fallback
        )}
      </section>

      <div>
        <VisitSiteButton
          url={site.url}
          slug={site.slug}
          name={site.name}
          className="inline-flex items-center rounded-md bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800"
        />
      </div>

      <Comments slug={site.slug} />
    </div>
  );
}
