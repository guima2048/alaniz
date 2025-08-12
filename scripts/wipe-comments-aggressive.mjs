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

async function deleteAllComments() {
  const supabase = getSupabase();
  
  console.log('🗑️ Tentando deletar TODOS os comentários...');
  
  // Estratégia 1: Deletar com condição sempre verdadeira
  try {
    console.log('📋 Estratégia 1: Deletar com condição sempre verdadeira...');
    const { error } = await supabase
      .from('comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (!error) {
      console.log('✅ Estratégia 1 funcionou!');
      return true;
    } else {
      console.log('❌ Estratégia 1 falhou:', error.message);
    }
  } catch (e) {
    console.log('❌ Estratégia 1 falhou:', e.message);
  }
  
  // Estratégia 2: Deletar com condição de data
  try {
    console.log('📋 Estratégia 2: Deletar com condição de data...');
    const { error } = await supabase
      .from('comments')
      .delete()
      .gte('createdAt', '1900-01-01');
    
    if (!error) {
      console.log('✅ Estratégia 2 funcionou!');
      return true;
    } else {
      console.log('❌ Estratégia 2 falhou:', error.message);
    }
  } catch (e) {
    console.log('❌ Estratégia 2 falhou:', e.message);
  }
  
  // Estratégia 3: Deletar em lotes muito pequenos
  try {
    console.log('📋 Estratégia 3: Deletar em lotes de 10...');
    let deleted = 0;
    let attempts = 0;
    const maxAttempts = 1000; // Limite de segurança
    
    while (attempts < maxAttempts) {
      const { data, error } = await supabase
        .from('comments')
        .select('id')
        .limit(10);
      
      if (error) throw new Error(error.message);
      if (!data || data.length === 0) break;
      
      const ids = data.map(row => row.id);
      const { error: deleteError } = await supabase
        .from('comments')
        .delete()
        .in('id', ids);
      
      if (deleteError) throw new Error(deleteError.message);
      
      deleted += ids.length;
      attempts++;
      
      if (attempts % 50 === 0) {
        console.log(`🗑️ Deletados ${deleted} comentários em ${attempts} tentativas...`);
        await sleep(1000);
      }
    }
    
    console.log(`✅ Estratégia 3 funcionou! Deletados ${deleted} comentários`);
    return true;
  } catch (e) {
    console.log('❌ Estratégia 3 falhou:', e.message);
  }
  
  return false;
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
    const success = await deleteAllComments();
    if (success) {
      console.log('🎉 Todos os comentários foram deletados!');
    } else {
      console.log('❌ Nenhuma estratégia funcionou.');
      console.log('\n💡 Para deletar manualmente:');
      console.log('1. Acesse: https://supabase.com/dashboard');
      console.log('2. Vá para seu projeto');
      console.log('3. Table Editor > comments');
      console.log('4. Clique em "Delete all rows"');
      console.log('5. Confirme a exclusão');
    }
  } else {
    console.log('✔ Nenhum comentário encontrado no Supabase');
  }
  
  const finalCount = await countComments();
  console.log(`🔎 Comentários restantes no Supabase: ${finalCount}`);
  
  console.log('🗑️ Limpando arquivo local src/data/comments.json...');
  wipeLocalFile();
}

main().catch((e) => { 
  console.error('❌ Erro:', e.message); 
  process.exit(1); 
});
