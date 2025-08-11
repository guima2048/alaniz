export const dynamic = "force-static";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";

type SiteItem = {
  slug: string;
  updated_at?: string;
};

type CategoryItem = {
  slug: string;
  updated_at?: string;
};

function xmlEscape(v: string) {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function GET() {
  const sitesFile = getDataFilePath("sites.json");
  const catsFile = getDataFilePath("categories.json");
  const allSites = await readJsonFile<SiteItem[]>(sitesFile, []);
  const categories = await readJsonFile<CategoryItem[]>(catsFile, []);
  
  const now = new Date();
  const lastmod = formatDate(now);

  const urls: Array<{
    loc: string;
    lastmod: string;
    changefreq: string;
    priority: string;
  }> = [];

  // Páginas principais
  urls.push({
    loc: `${BASE}/`,
    lastmod,
    changefreq: 'daily',
    priority: '1.0'
  });

  urls.push({
    loc: `${BASE}/categorias`,
    lastmod,
    changefreq: 'weekly',
    priority: '0.9'
  });

  urls.push({
    loc: `${BASE}/blog`,
    lastmod,
    changefreq: 'weekly',
    priority: '0.8'
  });

  urls.push({
    loc: `${BASE}/sobre`,
    lastmod,
    changefreq: 'monthly',
    priority: '0.7'
  });

  urls.push({
    loc: `${BASE}/contato`,
    lastmod,
    changefreq: 'monthly',
    priority: '0.6'
  });

  // Categorias
  for (const c of categories) {
    urls.push({
      loc: `${BASE}/categorias/${c.slug}`,
      lastmod: c.updated_at ? formatDate(new Date(c.updated_at)) : lastmod,
      changefreq: 'weekly',
      priority: '0.8'
    });
  }

  // Sites individuais
  for (const s of allSites) {
    urls.push({
      loc: `${BASE}/${s.slug}`,
      lastmod: s.updated_at ? formatDate(new Date(s.updated_at)) : lastmod,
      changefreq: 'weekly',
      priority: '0.9'
    });
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map((u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`)
      .join("\n") +
    "\n</urlset>\n";

  return new Response(body, {
    headers: { 
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    },
  });
}



