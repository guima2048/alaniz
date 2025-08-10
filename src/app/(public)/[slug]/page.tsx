export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { MDXRemote } from "next-mdx-remote/rsc";
import { RateForm } from "@/components/RateForm";
import { Comments } from "@/components/Comments";
import { VisitSiteButton } from "@/components/VisitSiteButton";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";
import { getBaseUrl } from "@/lib/url";

type Params = { slug: string };

type SiteItem = {
  slug: string;
  name: string;
  url: string;
  logo?: string;
  cover?: string;
  short_desc?: string;
  categories?: string[];
  price_min?: number;
  price_model?: string;
  style?: string;
  audience?: string;
  privacy_level?: string;
  editorial_score?: number;
  rating_avg?: number;
  rating_count?: number;
  features?: string[];
  hero?: string;
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const file = getDataFilePath("sites.json");
  const allSites = await readJsonFile<SiteItem[]>(file, []);
  const site = allSites.find((s) => s.slug === slug);
  return {
    title: `${site?.name ?? "Plataforma"} | Lista de Relacionamentos` ,
    description: site?.short_desc,
  };
}

export default async function EditorialPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const file = getDataFilePath("sites.json");
  const allSites = await readJsonFile<SiteItem[]>(file, []);
  const site = allSites.find((s) => s.slug === slug);
  if (!site) return <div className="container mx-auto px-4 py-8">Não encontrado.</div>;

  const mdxPath = path.join(process.cwd(), "src", "content", "editoriais", `${slug}.mdx`);
  const hasMdx = fs.existsSync(mdxPath);
  const fallback = (
    <div className="space-y-4">
      <p>
        Esta é uma análise editorial neutra da plataforma {site.name}. Nosso foco
        é descrever recursos, público e aspectos de privacidade sem promover
        comportamentos sensíveis.
      </p>
      <ul className="list-disc pl-5 text-neutral-700">
        <li>Preço mínimo: {site.price_min} ({site.price_model})</li>
        <li>Estilo: {site.style}</li>
        <li>Público: {site.audience}</li>
        <li>Nível de privacidade: {site.privacy_level}</li>
      </ul>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="space-y-2">
        {Boolean(site.hero) && (
          <div className="w-full">
            <img src={site.hero as string} alt="hero" className="w-full h-56 md:h-72 object-cover rounded" />
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

async function RatingBlock({ slug }: { slug: string }) {
  const res = await fetch(`${getBaseUrl()}/api/ratings?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { score: 0, count: 0 };
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-700">
      <span className="font-medium">Nota dos usuários:</span>
      <span>{data.score?.toFixed?.(2) ?? Number(data.score).toFixed(2)} / 10</span>
      <span>({data.count ?? 0} votos)</span>
    </div>
  );
}

