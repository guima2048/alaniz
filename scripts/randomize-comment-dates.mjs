#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

function assertEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Faltam envs: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anon, { auth: { persistSession: false } });
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomTimestamps(count) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999).getTime(); // ontem 23:59
  const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime(); // um ano atrás 00:00
  const times = new Array(count)
    .fill(0)
    .map(() => new Date(randomInt(start, end)).toISOString())
    .sort((a, b) => b.localeCompare(a)); // desc mais recente primeiro
  return times;
}

function interleaveBySlug(items) {
  // items: [{id, slug}]
  const bySlug = new Map();
  for (const it of items) {
    if (!bySlug.has(it.slug)) bySlug.set(it.slug, []);
    bySlug.get(it.slug).push(it);
  }
  // embaralhar cada grupo
  for (const arr of bySlug.values()) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  const groups = Array.from(bySlug.entries());
  // construir sequência intercalada sem repetir slug adjacente
  const result = [];
  let lastSlug = null;
  let remaining = items.length;
  while (remaining > 0) {
    // candidatos com itens restantes e slug diferente do anterior
    const candidates = groups.filter(([slug, arr]) => arr.length > 0 && slug !== lastSlug);
    // se não houver candidato (resta apenas o mesmo slug), relaxar a restrição
    const pickFrom = candidates.length ? candidates : groups.filter(([_, arr]) => arr.length > 0);
    // escolher grupo aleatório
    const [slug, arr] = pickFrom[Math.floor(Math.random() * pickFrom.length)];
    result.push(arr.pop());
    lastSlug = slug;
    remaining--;
  }
  return result;
}

async function main() {
  const supabase = assertEnv();

  // Buscar todos os comentários (apenas id e slug)
  // Buscar em páginas para superar limite padrão de 1k
  const pageSize = 1000;
  let from = 0;
  let comments = [];
  for (;;) {
    const { data, error } = await supabase
      .from('comments')
      .select('id, slug')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const batch = data || [];
    if (batch.length === 0) break;
    comments = comments.concat(batch);
    from += pageSize;
  }
  if (!comments.length) {
    console.log('Nenhum comentário encontrado.');
    return;
  }
  console.log(`Total de comentários: ${comments.length}`);

  // Gerar timestamps aleatórios entre ontem e 1 ano atrás
  const times = generateRandomTimestamps(comments.length);
  // Intercalar comentários por slug para evitar sequência do mesmo site
  const order = interleaveBySlug(comments);

  // Atribuir tempos na ordem (mais recente ao primeiro intercalado)
  const updates = order.map((c, idx) => ({ id: c.id, createdAt: times[idx] }));

  // Atualizar em lotes, efetuando update por id (evita conflito de NOT NULL)
  const chunkSize = Number(process.env.COMMENTS_CHUNK_SIZE || 200);
  let updated = 0;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    // Executar atualizações em paralelo dentro do lote
    const results = await Promise.all(
      chunk.map((u) => supabase.from('comments').update({ createdAt: u.createdAt }).eq('id', u.id).select('id'))
    );
    const errors = results.filter((r) => r.error);
    if (errors.length) {
      console.error(`Erros no lote ${i}-${i + chunk.length}:`, errors[0].error.message);
    }
    updated += chunk.length - errors.length;
    console.log(`✔ Atualizados ${updated}/${updates.length}`);
  }
  console.log('Concluído.');
}

main().catch((e) => { console.error(e); process.exit(1); });


