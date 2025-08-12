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

async function deleteAllComments() {
  const supabase = getSupabase();
  
  console.log('🗑️ Deletando TODOS os comentários com SQL direto...');
  
  // Usar SQL direto para deletar tudo de uma vez
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'DELETE FROM comments;'
  });
  
  if (error) {
    console.log('❌ Erro com SQL direto:', error.message);
    console.log('🔄 Tentando método alternativo...');
    
    // Método alternativo: deletar com condição sempre verdadeira
    const { error: altError } = await supabase
      .from('comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos exceto um ID impossível
    
    if (altError) {
      throw new Error(`Erro alternativo: ${altError.message}`);
    }
  }
  
  console.log('✔ Deletados todos os comentários!');
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
  try {
    await deleteAllComments();
    wipeLocalFile();
    console.log('🎉 Limpeza completa!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n📋 Para deletar manualmente:');
    console.log('1. Acesse: https://supabase.com/dashboard');
    console.log('2. Vá para seu projeto');
    console.log('3. Table Editor > comments');
    console.log('4. Clique em "Delete all rows"');
    console.log('5. Confirme a exclusão');
  }
}

main();
