import fs from 'node:fs';
import path from 'node:path';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

if (process.env.CI || process.env.VERCEL) {
  // Silenciar logs em CI
} else {
  console.log('🗜️ Gerando sitemap.xml.gz...');
}

async function generateSitemapGz() {
  try {
    // Caminhos
    const publicDir = path.join(process.cwd(), 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');
    // Se não existir, gerar baseado nos dados locais (mesma lógica da rota)
    if (!fs.existsSync(sitemapPath)) {
      const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com';
      const sitesPath = path.join(process.cwd(), 'src', 'data', 'sites.json');
      const catsPath = path.join(process.cwd(), 'src', 'data', 'categories.json');
      const now = new Date().toISOString().split('T')[0];
      let sites = [];
      let cats = [];
      try { sites = JSON.parse(fs.readFileSync(sitesPath, 'utf8')); } catch {}
      try { cats = JSON.parse(fs.readFileSync(catsPath, 'utf8')); } catch {}
      const urls = [];
      urls.push({ loc: `${BASE}/`, lastmod: now, changefreq: 'daily', priority: '1.0' });
      urls.push({ loc: `${BASE}/categorias`, lastmod: now, changefreq: 'weekly', priority: '0.9' });
      urls.push({ loc: `${BASE}/blog`, lastmod: now, changefreq: 'weekly', priority: '0.8' });
      urls.push({ loc: `${BASE}/sobre`, lastmod: now, changefreq: 'monthly', priority: '0.7' });
      urls.push({ loc: `${BASE}/contato`, lastmod: now, changefreq: 'monthly', priority: '0.6' });
      for (const c of cats) urls.push({ loc: `${BASE}/categorias/${c.slug}`, lastmod: now, changefreq: 'weekly', priority: '0.8' });
      for (const s of sites) urls.push({ loc: `${BASE}/${s.slug}`, lastmod: now, changefreq: 'weekly', priority: '0.9' });
      const xmlEscape = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map((u) => `  <url>\n    <loc>${xmlEscape(u.loc)}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
        `\n</urlset>\n`;
      fs.mkdirSync(publicDir, { recursive: true });
      fs.writeFileSync(sitemapPath, body, 'utf8');
    }

    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
    
    // Comprimir com gzip
    const compressed = await gzipAsync(sitemapContent);
    
    // Salvar sitemap.xml.gz
    const gzPath = path.join(process.cwd(), 'public', 'sitemap.xml.gz');
    fs.writeFileSync(gzPath, compressed);
    
    console.log('✅ sitemap.xml.gz gerado com sucesso!');
    console.log(`📊 Tamanho original: ${(sitemapContent.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Tamanho comprimido: ${(compressed.length / 1024).toFixed(2)} KB`);
    console.log(`📊 Taxa de compressão: ${((1 - compressed.length / sitemapContent.length) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Erro ao gerar sitemap.xml.gz:', error.message);
  }
}

generateSitemapGz();
