#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

function normalizeKey(k) {
  return String(k).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}
function parseCategoriesCell(val) {
  if (!val) return [];
  const s = String(val).trim();
  if (!s) return [];
  if (s.startsWith('[') && s.endsWith(']')) {
    try { return JSON.parse(s.replace(/'/g, '"')); } catch {}
  }
  return s.split(/[;,|]/).map((v) => v.trim()).filter(Boolean);
}

function pickHeaderRow(matrix) {
  const known = new Set(['site','nome','categorias','categories']);
  let headerIdx = 0, best = -1;
  matrix.forEach((row, idx) => {
    const score = row.reduce((acc, cell) => acc + (known.has(normalizeKey(cell)) ? 1 : 0), 0);
    if (score > best) { best = score; headerIdx = idx; }
  });
  return headerIdx;
}

async function main() {
  const bookPath = path.join(process.cwd(), 'Sites_relacionamento.xlsx');
  if (!fs.existsSync(bookPath)) {
    console.error('❌ Sites_relacionamento.xlsx não encontrado.');
    process.exit(1);
  }
  const wb = xlsx.readFile(bookPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const matrix = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const headerIdx = pickHeaderRow(matrix);
  const header = matrix[headerIdx].map((h, i) => normalizeKey(h) || `col_${i+1}`);
  const rows = matrix.slice(headerIdx + 1).map((arr) => { const obj = {}; header.forEach((k,i)=>obj[k]=arr[i]); return obj; });

  // Collect unique categories
  const titles = new Set();
  const siteToCats = new Map();
  for (const r of rows) {
    const siteName = r.site || r.nome || '';
    const cats = parseCategoriesCell(r.categorias || r.categories);
    cats.forEach((c) => titles.add(c));
    const slug = slugify(siteName);
    if (slug) siteToCats.set(slug, cats);
  }
  const categories = Array.from(titles).map((title) => ({ slug: slugify(title === 'Todos os Sites' ? 'todos' : title), title }));
  console.log(`Encontradas ${categories.length} categorias únicas.`);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let supabase = null;
  if (url && anon) supabase = createClient(url, anon, { auth: { persistSession: false } });

  if (supabase) {
    // Upsert categories
    for (const cat of categories) {
      const { error } = await supabase.from('categories').upsert({ slug: cat.slug, title: cat.title }, { onConflict: 'slug' });
      if (error) console.error('Erro upsert categoria', cat.slug, error.message);
    }
    console.log('✔ Tabela categories atualizada.');
    // Update sites.categories to slugs for UI consistency
    for (const [siteSlug, catTitles] of siteToCats) {
      const catSlugs = catTitles.map((t) => (t === 'Todos os Sites' ? 'todos' : slugify(t)));
      const { data: ex, error: e1 } = await supabase.from('sites').select('name, url').eq('slug', siteSlug).maybeSingle();
      if (e1) { console.error('Erro ao buscar site', siteSlug, e1.message); continue; }
      if (!ex) continue;
      const payload = { slug: siteSlug, name: ex.name || siteSlug, url: ex.url || '', categories: catSlugs };
      const { error: e2 } = await supabase.from('sites').upsert(payload, { onConflict: 'slug' });
      if (e2) console.error('Erro atualizar categorias do site', siteSlug, e2.message);
    }
    console.log('✔ categories dos sites atualizadas para slugs.');
  } else {
    // Fallback: write src/data/categories.json and update src/data/sites.json
    const catPath = path.join(process.cwd(), 'src', 'data', 'categories.json');
    fs.writeFileSync(catPath, JSON.stringify(categories, null, 2), 'utf8');

    const sitesPath = path.join(process.cwd(), 'src', 'data', 'sites.json');
    let current = [];
    try { current = JSON.parse(fs.readFileSync(sitesPath, 'utf8')); } catch {}
    const bySlug = new Map(current.map((s) => [s.slug, s]));
    for (const [siteSlug, catTitles] of siteToCats) {
      const catSlugs = catTitles.map((t) => (t === 'Todos os Sites' ? 'todos' : slugify(t)));
      const prev = bySlug.get(siteSlug) || { slug: siteSlug, name: siteSlug, url: '' };
      bySlug.set(siteSlug, { ...prev, categories: catSlugs });
    }
    fs.writeFileSync(sitesPath, JSON.stringify(Array.from(bySlug.values()), null, 2), 'utf8');
    console.log('✔ Arquivos locais de categorias e sites atualizados.');
  }
}

main().catch((e) => { console.error(e); process.exit(1); });


