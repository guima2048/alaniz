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
  // tentar achar cabeçalho com colunas típicas
  const known = new Set(['site','nome','usuario','user','comentario','comentarios','mensagem','data']);
  let headerIdx = 0, best = -1;
  matrix.forEach((row, idx) => {
    const score = row.reduce((acc, cell) => acc + (known.has(normalizeKey(cell)) ? 1 : 0), 0);
    if (score > best) { best = score; headerIdx = idx; }
  });
  return headerIdx;
}

function sanitizeName(name) {
  // Remover todos os '@' e espaços extras
  return String(name || '').replaceAll('@','').trim().slice(0,80);
}

function sanitizeMessage(msg) {
  let s = String(msg || '').trim();
  // Se houver ':', manter apenas o que vem depois da primeira ocorrência
  const i = s.indexOf(':');
  if (i !== -1) s = s.slice(i+1).trim();
  return s.slice(0, 1000);
}

async function upsertBatchSupabase(items) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  const supabase = createClient(url, anon, { auth: { persistSession: false } });
  const chunkSize = Number(process.env.COMMENTS_CHUNK_SIZE || 500);
  let inserted = 0;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize).map((it) => ({
      slug: it.slug,
      name: it.name,
      message: it.message,
      createdAt: it.createdAt,
    }));
    const { error } = await supabase.from('comments').insert(chunk, { returning: 'minimal' });
    if (error) {
      console.error(`Erro no lote ${i}-${i + chunk.length}:`, error.message);
      // continuar tentando próximos lotes
    } else {
      inserted += chunk.length;
      console.log(`✔ Inseridos ${inserted}/${items.length}`);
    }
  }
  return inserted > 0;
}

function writeLocal(items) {
  const file = path.join(process.cwd(), 'src', 'data', 'comments.json');
  let current = [];
  try { current = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
  const next = current.concat(items.map((it) => ({
    id: `${it.createdAt}-${Math.random().toString(36).slice(2,10)}`,
    slug: it.slug,
    name: it.name,
    message: it.message,
    createdAt: it.createdAt,
    status: 'approved',
  })));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(next, null, 2), 'utf8');
}

async function main() {
  const bookPath = path.join(process.cwd(), 'Comentarios.xlsx');
  if (!fs.existsSync(bookPath)) {
    console.error('❌ Comentarios.xlsx não encontrado na raiz.');
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
  const rows = matrix.slice(headerIdx + 1).map((arr) => { const obj = {}; header.forEach((k,i)=>obj[k]=arr[i]); return obj; });

  // Mapear colunas prováveis
  const itemsRaw = rows.map((r) => {
    const site = r.site || r.nome_do_site || r.plataforma || r.site_nome || r.nome || '';
    const slug = r.slug ? String(r.slug).trim() : slugify(site);
    const name = sanitizeName(r.nome || r.usuario || r.user || r.autor || r.nome_de_usuario || 'Usuário');
    const message = sanitizeMessage(r.comentario || r.comentarios || r.mensagem || r.texto || r.conteudo || '');
    const createdAt = new Date().toISOString();
    if (!slug || !name || !message) return null;
    return { slug, name, message, createdAt };
  }).filter(Boolean);

  // Deduplicar por slug + mensagem
  const seen = new Set();
  const items = [];
  for (const it of itemsRaw) {
    const key = `${it.slug}__${it.message.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(it);
  }

  if (!items.length) {
    console.error('❌ Nenhum comentário válido encontrado.');
    process.exit(1);
  }
  console.log(`Prontos para inserir: ${items.length} comentários.`);

  let ok = await upsertBatchSupabase(items);
  if (!ok) {
    console.warn('⚠️ Falha no Supabase ou sem credenciais; salvando local.');
    writeLocal(items);
  }
}

main().catch((e)=>{ console.error(e); process.exit(1); });


