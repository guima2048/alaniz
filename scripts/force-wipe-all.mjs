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
    // Garantir que o diretório existe
    fs.mkdirSync(path.dirname(file), { recursive: true });
    
    // Forçar escrita de array vazio
    fs.writeFileSync(file, '[]', 'utf8');
    
    // Verificar se foi escrito corretamente
    const content = fs.readFileSync(file, 'utf8');
    const parsed = JSON.parse(content);
    
    if (Array.isArray(parsed) && parsed.length === 0) {
      console.log('✅ Arquivo local limpo com sucesso');
      return true;
    } else {
      console.log('❌ Erro: arquivo não está vazio');
      return false;
    }
  } catch (e) {
    console.log('❌ Erro ao limpar arquivo local:', e.message);
    return false;
  }
}

async function forceDeleteAllSupabaseComments() {
  const supabase = getSupabase();
  let totalDeleted = 0;
  let attempts = 0;
  const maxAttempts = 5000; // Aumentar muito o limite
  
  console.log('🗑️ FORÇANDO deleção de TODOS os comentários do Supabase...');
  
  while (attempts < maxAttempts) {
    // Buscar um lote muito pequeno
    const { data, error } = await supabase
      .from('comments')
      .select('id')
      .limit(1); // Deletar um por vez
    
    if (error) {
      console.log('❌ Erro ao buscar comentários:', error.message);
      break;
    }
    
    if (!data || data.length === 0) {
      console.log('✅ Não há mais comentários para deletar');
      break;
    }
    
    // Deletar este comentário
    const id = data[0].id;
    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.log('❌ Erro ao deletar comentário:', deleteError.message);
      break;
    }
    
    totalDeleted++;
    attempts++;
    
    if (attempts % 100 === 0) {
      console.log(`🗑️ Deletados ${totalDeleted} comentários em ${attempts} tentativas...`);
      await sleep(100); // Pausa muito pequena
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
    console.log('\n🗑️ FORÇANDO limpeza do Supabase...');
    const deleted = await forceDeleteAllSupabaseComments();
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
