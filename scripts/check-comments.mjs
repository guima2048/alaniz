#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Faltam envs: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return createClient(url, anon, { auth: { persistSession: false } });
}

async function checkSupabaseComments() {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });
  
  if (error) {
    console.log('❌ Erro ao contar comentários no Supabase:', error.message);
    return -1;
  }
  
  return count || 0;
}

function checkLocalComments() {
  const file = path.join(process.cwd(), 'src', 'data', 'comments.json');
  try {
    if (!fs.existsSync(file)) {
      return 0;
    }
    const content = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch (e) {
    console.log('❌ Erro ao ler arquivo local:', e.message);
    return -1;
  }
}

async function main() {
  console.log('🔍 Verificando comentários...\n');
  
  const supabaseCount = await checkSupabaseComments();
  const localCount = checkLocalComments();
  
  console.log(`📊 Supabase: ${supabaseCount} comentários`);
  console.log(`📁 Local: ${localCount} comentários`);
  
  if (supabaseCount === 0 && localCount === 0) {
    console.log('\n✅ Todos os comentários foram deletados com sucesso!');
  } else {
    console.log('\n⚠️ Ainda existem comentários para deletar.');
  }
}

main().catch((e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});
