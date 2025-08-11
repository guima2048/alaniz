export const dynamic = "force-static";

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://example.com";
  
  const body = `User-agent: *
Allow: /

# Bloquear áreas administrativas
Disallow: /admin/
Disallow: /admin-config/

# Permitir APIs públicas
Allow: /api/categories
Allow: /api/posts
Allow: /api/sites
Allow: /api/comments
Allow: /api/ratings

# Bloquear APIs administrativas
Disallow: /api/admin/

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay para ser respeitoso
Crawl-delay: 1`;
  
  return new Response(body, {
    headers: { 
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400"
    },
  });
}







