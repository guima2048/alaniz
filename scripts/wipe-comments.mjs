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

async function countComments() {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

async function deleteCommentsInBatches() {
  const supabase = getSupabase();
  const batchSize = 100;
  let deleted = 0;
  
  while (true) {
    // Buscar um lote de IDs
    const { data, error } = await supabase
      .from('comments')
      .select('id')
      .limit(batchSize);
    
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) break;
    
    // Deletar este lote
    const ids = data.map(row => row.id);
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .in('id', ids);
    
    if (deleteError) throw new Error(deleteError.message);
    
    deleted += ids.length;
    console.log(`🗑️ Deletados ${deleted} comentários...`);
  }
  
  return deleted;
}

function wipeLocalFile() {
  const file = path.join(process.cwd(), 'src', 'data', 'comments.json');
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '[]', 'utf8');
  } catch (e) {
    // ignore
  }
}

async function main() {
  console.log('🔍 Contando comentários no Supabase...');
  const initialCount = await countComments();
  console.log(`📊 Encontrados ${initialCount} comentários no Supabase`);
  
  if (initialCount > 0) {
    console.log('🗑️ Apagando comentários em lotes...');
    const deleted = await deleteCommentsInBatches();
    console.log(`✔ Deletados ${deleted} comentários no Supabase`);
  } else {
    console.log('✔ Nenhum comentário encontrado no Supabase');
  }
  
  const finalCount = await countComments();
  console.log(`🔎 Comentários restantes no Supabase: ${finalCount}`);
  
  console.log('🗑️ Limpando arquivo local src/data/comments.json...');
  wipeLocalFile();
  console.log('✔ Arquivo local limpo.');
  
  const localFile = path.join(process.cwd(), 'src', 'data', 'comments.json');
  try {
    const parsed = JSON.parse(fs.readFileSync(localFile, 'utf8'));
    console.log(`🔎 Comentários no arquivo local: ${Array.isArray(parsed) ? parsed.length : 0}`);
  } catch {
    console.log('🔎 Comentários no arquivo local: 0');
  }
}

main().catch((e) => { 
  console.error('❌ Erro:', e.message); 
  process.exit(1); 
});


