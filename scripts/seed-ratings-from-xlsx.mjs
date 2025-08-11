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

function pickHeaderRow(matrix) {
  const known = new Set(['site','nome','nota','avaliacoes']);
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let supabase = null;
  if (url && anon) supabase = createClient(url, anon, { auth: { persistSession: false } });

  let count = 0;
  for (const r of rows) {
    const name = r.site || r.nome || '';
    const slug = slugify(name);
    const score = Number(r.nota || 0);
    const votes = Number(r.avaliacoes || 0);
    if (!slug || !(score >= 0) || !(votes >= 0)) continue;
    if (supabase) {
      const payload = { slug, score, count: votes };
      const { error } = await supabase.from('ratings').upsert(payload, { onConflict: 'slug' });
      if (error) { console.error('Erro upsert rating', slug, error.message); continue; }
      count++;
    } else {
      // local fallback
      const file = path.join(process.cwd(), 'src', 'data', 'ratings.json');
      let list = [];
      try { list = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
      const idx = list.findIndex((it) => it.slug === slug);
      if (idx === -1) list.push({ slug, score, count: votes });
      else list[idx] = { slug, score, count: votes };
      fs.writeFileSync(file, JSON.stringify(list, null, 2), 'utf8');
      count++;
    }
  }
  console.log(`✔ Ratings atualizados: ${count}`);
}

main().catch((e)=>{ console.error(e); process.exit(1); });


