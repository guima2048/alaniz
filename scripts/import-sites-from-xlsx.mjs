#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

// Utilidades
function toArray(value) {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  const s = String(value).trim();
  if (!s) return [];
  return s
    .split(/[;,|]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function toNumber(value) {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function parsePrice(value) {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  const s = String(value)
    .replace(/\s/g, '')
    .replace(/R\$/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function normalizeKey(k) {
  return String(k)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function mapRow(raw) {
  // Normaliza chaves da planilha
  const row = {};
  for (const [k, v] of Object.entries(raw)) {
    row[normalizeKey(k)] = v;
  }

  const site = {
    slug: String(row.slug || row.identificador || slugify(row.site || row.nome || row.name || '')).trim(),
    name: String(row.name || row.nome || row.site || '').trim(),
    url: String(row.url || row.link || '').trim(),
    logo: row.logo ? String(row.logo).trim() : undefined,
    cover: row.cover ? String(row.cover).trim() : undefined,
    hero: row.hero ? String(row.hero).trim() : undefined,
    short_desc: row.short_desc || row.descricao_curta || row.descricao ? String(row.short_desc || row.descricao_curta || row.descricao).trim() : '',
    categories: (() => {
      const raw = row.categories || row.categorias;
      if (!raw) return [];
      const s = String(raw).trim();
      if (s.startsWith('[') && s.endsWith(']')) {
        try {
          return JSON.parse(s.replace(/'/g, '"'));
        } catch {}
      }
      return toArray(s);
    })(),
    price_min: parsePrice(row.price_min || row.preco_min || row.preco_minimo),
    price_model: row.price_model || row.modelo_preco || row.modelo_de_preco ? String(row.price_model || row.modelo_preco || row.modelo_de_preco).trim() : undefined,
    style: String(row.style || row.estilo || '').trim() || undefined,
    audience: row.audience || row.publico ? String(row.audience || row.publico).trim() : undefined,
    privacy_level: row.privacy_level || row.privacidade ? String(row.privacy_level || row.privacidade).trim() : undefined,
    editorial_score: toNumber(row.editorial_score || row.nota_editorial),
    rating_avg: toNumber(row.rating_avg || row.nota),
    rating_count: toNumber(row.rating_count || row.avaliacoes),
    features: toArray(row.features || row.recursos),
  };

  if (!site.slug || !site.name) return null;
  return site;
}

async function importToSupabase(sites) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn('⚠️ Variáveis NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes. Pulando Supabase.');
    return false;
  }
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  for (const site of sites) {
    const { error } = await supabase.from('sites').upsert(site, { onConflict: 'slug' });
    if (error) {
      console.error(`Supabase erro no slug ${site.slug}:`, error.message);
      return false;
    }
    console.log(`✔ Upsert Supabase: ${site.slug}`);
  }
  return true;
}

async function importToLocalJson(sites) {
  const file = path.join(process.cwd(), 'src', 'data', 'sites.json');
  let current = [];
  try {
    current = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!Array.isArray(current)) current = [];
  } catch {
    // vazio
  }
  const bySlug = new Map(current.map((s) => [s.slug, s]));
  for (const site of sites) {
    bySlug.set(site.slug, { ...bySlug.get(site.slug), ...site });
  }
  const next = Array.from(bySlug.values());
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), 'utf8');
  console.log(`✔ Gravado ${next.length} itens em src/data/sites.json`);
  return true;
}

async function main() {
  const root = process.cwd();
  const xlsxPath = path.join(root, 'Sites_relacionamento.xlsx');
  if (!fs.existsSync(xlsxPath)) {
    console.error('❌ Arquivo Sites_relacionamento.xlsx não encontrado na raiz do projeto.');
    process.exit(1);
  }

  const wb = xlsx.readFile(xlsxPath, { cellDates: false });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];

  // Lê como matriz para detectar a linha de cabeçalho correta
  const matrix = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!Array.isArray(matrix) || matrix.length === 0) {
    console.error('❌ Planilha vazia.');
    process.exit(1);
  }

  // Encontra a linha de cabeçalho pelo melhor match de campos conhecidos
  const known = new Set(['slug','identificador','name','nome','url','short_desc','descricao_curta']);
  let headerIdx = 0;
  let bestScore = -1;
  matrix.forEach((row, idx) => {
    const score = row.reduce((acc, cell) => acc + (known.has(normalizeKey(cell)) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      headerIdx = idx;
    }
  });

  const headerRaw = matrix[headerIdx];
  const header = headerRaw.map((h, i) => normalizeKey(h) || `col_${i+1}`);
  const dataRows = matrix.slice(headerIdx + 1);

  const rows = dataRows.map((arr) => {
    const obj = {};
    header.forEach((k, i) => {
      obj[k] = arr[i];
    });
    return obj;
  });

  const sites = rows.map(mapRow).filter(Boolean);
  if (!sites.length) {
    console.error('❌ Nenhuma linha válida encontrada na planilha.');
    process.exit(1);
  }
  console.log(`Encontrados ${sites.length} sites na planilha.`);

  const prefer = (process.env.IMPORT_TARGET || '').toLowerCase();
  let ok = false;
  if (prefer !== 'file') {
    ok = await importToSupabase(sites);
  }
  if (!ok) {
    await importToLocalJson(sites);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


