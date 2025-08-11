#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';

function normalizeKey(k) {
  return String(k)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function pickHeaderRow(matrix) {
  const known = new Set(['slug','tema_do_artigo','meta_title','meta_description','resumo','conteudo','categoria']);
  let headerIdx = 0;
  let best = -1;
  matrix.forEach((row, idx) => {
    const score = row.reduce((acc, cell) => acc + (known.has(normalizeKey(cell)) ? 1 : 0), 0);
    if (score > best) {
      best = score; headerIdx = idx;
    }
  });
  return headerIdx;
}

function mapRow(raw) {
  const row = {};
  for (const [k, v] of Object.entries(raw)) row[normalizeKey(k)] = v;

  const title = String(row.meta_title || row.tema_do_artigo || '').trim();
  const slug = String(row.slug || slugify(title)).trim();
  const excerpt = String(row.resumo || row.meta_description || '').trim();
  const content = String(row.conteudo || '').trim();
  const category = String(row.categoria || '').trim() || undefined;

  if (!slug || !title) return null;
  return { slug, title, excerpt, content, category };
}

async function upsertSupabase(posts) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  for (const p of posts) {
    const { error } = await supabase
      .from('posts')
      .upsert({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || '',
        content: p.content || '',
        cover: p.cover,
        published_at: p.published_at,
      }, { onConflict: 'slug' });
    if (error) {
      console.error('Supabase erro em', p.slug, error.message);
      return false;
    }
    console.log('✔ Upsert post Supabase:', p.slug);
  }
  return true;
}

function upsertLocalFile(posts) {
  const file = path.join(process.cwd(), 'src', 'data', 'posts.json');
  let current = [];
  try { current = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  if (!Array.isArray(current)) current = [];
  const bySlug = new Map(current.map((p) => [p.slug, p]));
  for (const p of posts) bySlug.set(p.slug, { ...bySlug.get(p.slug), ...p });
  const next = Array.from(bySlug.values());
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), 'utf8');
  console.log('✔ posts salvos em src/data/posts.json:', next.length);
}

async function main() {
  const bookPath = path.join(process.cwd(), 'Posts.xlsx');
  if (!fs.existsSync(bookPath)) {
    console.error('❌ Posts.xlsx não encontrado na raiz.');
    process.exit(1);
  }
  const wb = xlsx.readFile(bookPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const matrix = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!matrix.length) {
    console.error('❌ Planilha vazia.');
    process.exit(1);
  }
  const headerIdx = pickHeaderRow(matrix);
  const header = matrix[headerIdx].map((h, i) => normalizeKey(h) || `col_${i+1}`);
  const rows = matrix.slice(headerIdx + 1).map((arr) => {
    const obj = {}; header.forEach((k, i) => { obj[k] = arr[i]; }); return obj;
  });
  const posts = rows.map(mapRow).filter(Boolean);
  if (!posts.length) {
    console.error('❌ Nenhum post válido encontrado.');
    process.exit(1);
  }
  console.log(`Encontrados ${posts.length} posts.`);

  let ok = await upsertSupabase(posts);
  if (!ok) console.warn('⚠️ Falha no Supabase ou sem credenciais; salvando apenas local.');
  upsertLocalFile(posts);
}

main().catch((e) => { console.error(e); process.exit(1); });


