#!/usr/bin/env node
import xlsx from 'xlsx';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function normalizeKey(k) {
  return String(k).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}
function slugify(text) {
  return String(text || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
function sanitizeName(name) {
  return String(name || '').replaceAll('@','').trim().slice(0,80);
}
function sanitizeMessage(msg) {
  let s = String(msg || '').trim();
  const i = s.indexOf(':');
  if (i !== -1) s = s.slice(i+1).trim();
  return s.slice(0, 1000);
}
function pickHeaderRow(matrix) {
  const known = new Set(['site','nome','usuario','user','comentario','comentarios','mensagem','data']);
  let headerIdx = 0, best = -1;
  matrix.forEach((row, idx) => {
    const score = row.reduce((acc, cell) => acc + (known.has(normalizeKey(cell)) ? 1 : 0), 0);
    if (score > best) { best = score; headerIdx = idx; }
  });
  return headerIdx;
}
function isPriorityWindow(d) {
  const day = d.getDay(); // 0=Sun,6=Sat
  const hour = d.getHours();
  const weekend = day === 0 || day === 6;
  const daytime = hour >= 8 && hour < 20;
  return weekend || daytime;
}
function sampleDateBetween(startMs, endMs, wantPriority) {
  for (let tries = 0; tries < 2000; tries++) {
    const t = Math.floor(Math.random() * (endMs - startMs + 1)) + startMs;
    const d = new Date(t);
    if (isPriorityWindow(d) === wantPriority) return d;
  }
  // fallback se não achou em N tentativas
  return new Date(Math.floor(Math.random() * (endMs - startMs + 1)) + startMs);
}
function interleaveBySlug(items) {
  const bySlug = new Map();
  for (const it of items) {
    if (!bySlug.has(it.slug)) bySlug.set(it.slug, []);
    bySlug.get(it.slug).push(it);
  }
  for (const arr of bySlug.values()) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  const groups = Array.from(bySlug.entries());
  const result = [];
  let lastSlug = null;
  let remaining = items.length;
  while (remaining > 0) {
    const candidates = groups.filter(([slug, arr]) => arr.length > 0 && slug !== lastSlug);
    const pickFrom = candidates.length ? candidates : groups.filter(([_, arr]) => arr.length > 0);
    const [slug, arr] = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    result.push(arr.pop());
    lastSlug = slug;
    remaining--;
  }
  return result;
}

async function insertSupabase(items) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Faltam envs: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const chunkSize = Number(process.env.COMMENTS_CHUNK_SIZE || 500);
  let inserted = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const payload = chunk.map((it) => ({ slug: it.slug, name: it.name, message: it.message, createdAt: it.createdAt }));
    const { error } = await supabase.from('comments').insert(payload, { returning: 'minimal' });
    if (error) {
      console.error(`Erro no lote ${i}-${i + chunk.length}:`, error.message);
    } else {
      inserted += chunk.length;
      console.log(`✔ Inseridos ${inserted}/${items.length}`);
    }
  }
  return inserted;
}

async function main() {
  const bookPath = path.join(process.cwd(), 'Comentarios.xlsx');
  if (!fs.existsSync(bookPath)) throw new Error('Comentarios.xlsx não encontrado.');
  const wb = xlsx.readFile(bookPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const matrix = xlsx.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!matrix.length) throw new Error('Planilha vazia.');
  const headerIdx = pickHeaderRow(matrix);
  const header = matrix[headerIdx].map((h, i) => normalizeKey(h) || `col_${i+1}`);
  const rows = matrix.slice(headerIdx + 1).map((arr) => { const obj = {}; header.forEach((k,i)=>obj[k]=arr[i]); return obj; });

  const itemsRaw = rows.map((r) => {
    const site = r.site || r.nome_do_site || r.plataforma || r.site_nome || r.nome || '';
    const slug = r.slug ? String(r.slug).trim() : slugify(site);
    const name = sanitizeName(r.nome || r.usuario || r.user || r.autor || r.nome_de_usuario || 'Usuário');
    const message = sanitizeMessage(r.comentario || r.comentarios || r.mensagem || r.texto || r.conteudo || '');
    if (!slug || !name || !message) return null;
    return { slug, name, message };
  }).filter(Boolean);

  // Deduplicar por slug + mensagem
  const seen = new Set();
  const base = [];
  for (const it of itemsRaw) {
    const key = `${it.slug}__${it.message.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    base.push(it);
  }
  if (!base.length) throw new Error('Nenhum comentário válido.');

  // Intercalar por site
  const interleaved = interleaveBySlug(base);

  // Gerar datas com prioridade (~30% em horários diurnos ou fins de semana)
  const ratio = Math.max(0, Math.min(1, Number(process.env.PRIORITY_RATIO ?? 0.3)));
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999).getTime();
  const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
  const total = interleaved.length;
  const numPriority = Math.round(total * ratio);
  const stamps = [];
  for (let i = 0; i < numPriority; i++) stamps.push(sampleDateBetween(start, end, true));
  for (let i = numPriority; i < total; i++) stamps.push(sampleDateBetween(start, end, false));
  // Embaralhar e ordenar desc para parecer timeline realista
  for (let i = stamps.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [stamps[i], stamps[j]] = [stamps[j], stamps[i]];
  }
  stamps.sort((a, b) => b.getTime() - a.getTime());

  const items = interleaved.map((it, idx) => ({ ...it, createdAt: stamps[idx].toISOString() }));

  console.log(`Inserindo ${items.length} comentários com ~${Math.round(ratio*100)}% em janelas prioritárias...`);
  const inserted = await insertSupabase(items);
  console.log(`Concluído: ${inserted} registros inseridos.`);
}

main().catch((e) => { console.error(e); process.exit(1); });


