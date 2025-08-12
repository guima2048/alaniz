#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Faltam envs: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anon, { auth: { persistSession: false } });
}

function normalizeMessage(s) {
  return String(s || '').trim().toLowerCase();
}

function startEndOfTodayUTC() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
}

async function fetchAllComments(supabase) {
  const pageSize = 1000;
  let from = 0;
  const all = [];
  for (;;) {
    const { data, error } = await supabase
      .from('comments')
      .select('id, slug, name, message, createdAt')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);
    const batch = data || [];
    if (!batch.length) break;
    all.push(...batch);
    from += pageSize;
  }
  return all;
}

async function dedupe(supabase, all) {
  const map = new Map();
  const toDelete = [];
  for (const c of all) {
    const key = `${c.slug}__${normalizeMessage(c.message)}`;
    if (!map.has(key)) {
      map.set(key, c);
    } else {
      // manter o mais antigo
      const keep = map.get(key);
      const curTs = new Date(c.createdAt).getTime();
      const keepTs = new Date(keep.createdAt).getTime();
      if (curTs < keepTs) {
        // novo mais antigo; deletar o anterior
        toDelete.push(keep.id);
        map.set(key, c);
      } else {
        toDelete.push(c.id);
      }
    }
  }
  console.log(`Identificados ${toDelete.length} duplicados para exclusão.`);
  // deletar em sublotes
  for (let i = 0; i < toDelete.length; i += 50) {
    const slice = toDelete.slice(i, i + 50);
    const { error } = await supabase.from('comments').delete().in('id', slice);
    if (error) throw new Error(error.message);
  }
}

async function removeBurstAt1851(supabase) {
  const { start, end } = startEndOfTodayUTC();
  // Buscar somente de hoje para detectar minuto 18:51Z
  const { data, error } = await supabase
    .from('comments')
    .select('id, createdAt')
    .gte('createdAt', start)
    .lte('createdAt', end);
  if (error) throw new Error(error.message);
  const today = data || [];
  if (!today.length) {
    console.log('Nenhum comentário de hoje encontrado.');
    return;
  }
  const byMinute = new Map();
  for (const c of today) {
    const minuteKey = c.createdAt.slice(0, 16); // YYYY-MM-DDTHH:MM
    byMinute.set(minuteKey, (byMinute.get(minuteKey) || 0) + 1);
  }
  // procurar explicitamente 18:51 (UTC) e também o pico
  const todayDate = today[0].createdAt.slice(0, 10);
  const key1851 = `${todayDate}T18:51`;
  let targets = today.filter((c) => c.createdAt.slice(0, 16) === key1851).map((c) => c.id);
  // Se 18:51 não tiver registros, eliminar minuto com maior concentração acima de um limiar
  if (!targets.length) {
    let maxKey = null; let maxVal = 0;
    for (const [k, v] of byMinute.entries()) {
      if (v > maxVal) { maxVal = v; maxKey = k; }
    }
    if (maxKey && maxVal > Math.max(50, Math.floor(today.length * 0.3))) {
      targets = today.filter((c) => c.createdAt.slice(0, 16) === maxKey).map((c) => c.id);
      console.log(`Removendo pico de hoje no minuto ${maxKey} (${targets.length} itens).`);
    }
  } else {
    console.log(`Removendo burst de hoje às 18:51 UTC (${targets.length} itens).`);
  }
  for (let i = 0; i < targets.length; i += 50) {
    const slice = targets.slice(i, i + 50);
    const { error: delErr } = await supabase.from('comments').delete().in('id', slice);
    if (delErr) throw new Error(delErr.message);
  }
}

async function main() {
  const supabase = getClient();
  console.log('Carregando comentários...');
  const all = await fetchAllComments(supabase);
  console.log(`Total carregado: ${all.length}`);
  await dedupe(supabase, all);
  await removeBurstAt1851(supabase);
  console.log('Limpeza concluída.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });


