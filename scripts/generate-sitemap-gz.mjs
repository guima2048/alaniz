import fs from 'node:fs';
import path from 'node:path';
import { gzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);

console.log('🗜️ Gerando sitemap.xml.gz...');

async function generateSitemapGz() {
  try {
    // Ler o sitemap.xml atual
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    
    if (!fs.existsSync(sitemapPath)) {
      console.log('⚠️ sitemap.xml não encontrado em public/. Execute o build primeiro.');
      return;
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
