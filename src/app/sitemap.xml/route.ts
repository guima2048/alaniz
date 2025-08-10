export const dynamic = "force-static";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

type SiteItem = {
  slug: string;
};

type CategoryItem = {
  slug: string;
};

function xmlEscape(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET() {
  const sitesFile = getDataFilePath("sites.json");
  const catsFile = getDataFilePath("categories.json");
  const allSites = await readJsonFile<SiteItem[]>(sitesFile, []);
  const categories = await readJsonFile<CategoryItem[]>(catsFile, []);

  const urls: string[] = [];
  urls.push(`${BASE}/`);
  urls.push(`${BASE}/categorias`);
  for (const c of categories) urls.push(`${BASE}/categorias/${c.slug}`);
  for (const s of allSites) urls.push(`${BASE}/${s.slug}`);

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`)
      .join("\n") +
    "\n</urlset>\n";

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}



