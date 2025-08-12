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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function countComments() {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count || 0;
}

async function deleteCommentsInSmallBatches() {
  const supabase = getSupabase();
  const batchSize = 50; // Lotes menores
  let totalDeleted = 0;
  let batchCount = 0;
  
  while (true) {
    // Buscar um lote pequeno
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
    
    totalDeleted += ids.length;
    batchCount++;
    
    console.log(`🗑️ Lote ${batchCount}: Deletados ${ids.length} comentários (Total: ${totalDeleted})`);
    
    // Pausa entre lotes para evitar timeout
    if (batchCount % 10 === 0) {
      console.log('⏳ Pausa de 2 segundos...');
      await sleep(2000);
    }
  }
  
  return totalDeleted;
}

function wipeLocalFile() {
  const file = path.join(process.cwd(), 'src', 'data', 'comments.json');
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '[]', 'utf8');
    console.log('✔ Arquivo local limpo.');
  } catch (e) {
    console.log('⚠️ Erro ao limpar arquivo local:', e.message);
  }
}

async function main() {
  console.log('🔍 Contando comentários no Supabase...');
  const initialCount = await countComments();
  console.log(`📊 Encontrados ${initialCount} comentários no Supabase`);
  
  if (initialCount > 0) {
    console.log('🗑️ Apagando comentários em lotes pequenos...');
    const deleted = await deleteCommentsInSmallBatches();
    console.log(`✔ Deletados ${deleted} comentários no Supabase`);
  } else {
    console.log('✔ Nenhum comentário encontrado no Supabase');
  }
  
  const finalCount = await countComments();
  console.log(`🔎 Comentários restantes no Supabase: ${finalCount}`);
  
  console.log('🗑️ Limpando arquivo local src/data/comments.json...');
  wipeLocalFile();
  
  if (finalCount === 0) {
    console.log('🎉 Todos os comentários foram deletados com sucesso!');
  } else {
    console.log(`⚠️ Ainda restam ${finalCount} comentários no Supabase.`);
    console.log('💡 Para deletar manualmente:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto');
    console.log('3. Table Editor > comments');
    console.log('4. Clique em "Delete all rows"');
  }
}

main().catch((e) => { 
  console.error('❌ Erro:', e.message); 
  process.exit(1); 
});
