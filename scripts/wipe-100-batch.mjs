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

function forceWipeLocalFile() {
  const file = path.join(process.cwd(), 'src', 'data', 'comments.json');
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '[]', 'utf8');
    console.log('✅ Arquivo local limpo com sucesso');
    return true;
  } catch (e) {
    console.log('❌ Erro ao limpar arquivo local:', e.message);
    return false;
  }
}

async function deleteCommentsInBatchesOf100() {
  const supabase = getSupabase();
  let totalDeleted = 0;
  let batchCount = 0;
  
  console.log('🗑️ Deletando comentários em lotes de 100...');
  
  while (true) {
    // Buscar um lote de 100 IDs
    const { data, error } = await supabase
      .from('comments')
      .select('id')
      .limit(100);
    
    if (error) {
      console.log('❌ Erro ao buscar comentários:', error.message);
      break;
    }
    
    if (!data || data.length === 0) {
      console.log('✅ Não há mais comentários para deletar');
      break;
    }
    
    // Deletar este lote
    const ids = data.map(row => row.id);
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .in('id', ids);
    
    if (deleteError) {
      console.log('❌ Erro ao deletar lote:', deleteError.message);
      break;
    }
    
    totalDeleted += ids.length;
    batchCount++;
    
    console.log(`🗑️ Lote ${batchCount}: Deletados ${ids.length} comentários (Total: ${totalDeleted})`);
    
    // Pausa entre lotes
    if (batchCount % 10 === 0) {
      console.log('⏳ Pausa de 1 segundo...');
      await sleep(1000);
    }
  }
  
  return totalDeleted;
}

async function main() {
  console.log('🔍 Verificando comentários...\n');
  
  // Verificar Supabase
  const supabaseCount = await countComments();
  console.log(`📊 Supabase: ${supabaseCount} comentários`);
  
  // Verificar arquivo local
  const localFile = path.join(process.cwd(), 'src', 'data', 'comments.json');
  let localCount = 0;
  try {
    if (fs.existsSync(localFile)) {
      const content = fs.readFileSync(localFile, 'utf8');
      const parsed = JSON.parse(content);
      localCount = Array.isArray(parsed) ? parsed.length : 0;
    }
  } catch (e) {
    console.log('❌ Erro ao ler arquivo local:', e.message);
  }
  console.log(`📁 Local: ${localCount} comentários`);
  
  // Limpar Supabase se necessário
  if (supabaseCount > 0) {
    console.log('\n🗑️ Limpando Supabase em lotes de 100...');
    const deleted = await deleteCommentsInBatchesOf100();
    console.log(`✅ Deletados ${deleted} comentários do Supabase`);
  }
  
  // Limpar arquivo local
  console.log('\n🗑️ Limpando arquivo local...');
  const localCleaned = forceWipeLocalFile();
  
  // Verificação final
  console.log('\n🔍 Verificação final...');
  const finalSupabaseCount = await countComments();
  console.log(`📊 Supabase: ${finalSupabaseCount} comentários`);
  
  const finalLocalCount = (() => {
    try {
      const content = fs.readFileSync(localFile, 'utf8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  })();
  console.log(`📁 Local: ${finalLocalCount} comentários`);
  
  if (finalSupabaseCount === 0 && finalLocalCount === 0) {
    console.log('\n🎉 TODOS os comentários foram deletados com sucesso!');
  } else {
    console.log('\n⚠️ Ainda existem comentários para deletar.');
    if (finalSupabaseCount > 0) {
      console.log('\n💡 Para deletar manualmente no Supabase:');
      console.log('1. Acesse: https://supabase.com/dashboard');
      console.log('2. Vá para seu projeto');
      console.log('3. Table Editor > comments');
      console.log('4. Clique em "Delete all rows"');
      console.log('5. Ou use SQL: DELETE FROM comments;');
    }
  }
}

main().catch((e) => { 
  console.error('❌ Erro:', e.message); 
  process.exit(1); 
});
