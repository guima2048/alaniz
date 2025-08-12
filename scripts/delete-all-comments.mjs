#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false },
  });
}

async function deleteAllComments() {
  console.log('🗑️ Iniciando deleção de todos os comentários...');
  
  // 1. Deletar do Supabase
  const supabase = getSupabase();
  if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('🔗 Tentando deletar do Supabase...');
    try {
      // Primeiro, vamos contar quantos comentários existem
      const { count, error: countError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.log('❌ Erro ao contar comentários no Supabase:', countError.message);
      } else {
        console.log(`📊 Encontrados ${count || 0} comentários no Supabase`);
        
        if (count > 0) {
          // Deletar todos os comentários
          const { error } = await supabase
            .from('comments')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar todos exceto um ID impossível
          
          if (error) {
            console.log('❌ Erro ao deletar comentários do Supabase:', error.message);
          } else {
            console.log('✅ Todos os comentários deletados do Supabase com sucesso!');
          }
        } else {
          console.log('ℹ️ Nenhum comentário encontrado no Supabase');
        }
      }
    } catch (e) {
      console.log('❌ Erro ao acessar Supabase:', e.message);
    }
  } else {
    console.log('ℹ️ Supabase não configurado');
  }
  
  // 2. Deletar do arquivo local
  console.log('📁 Deletando do arquivo local...');
  const file = path.join(process.cwd(), 'src', 'data', 'comments.json');
  
  try {
    if (fs.existsSync(file)) {
      const currentData = fs.readFileSync(file, 'utf8');
      const comments = JSON.parse(currentData);
      console.log(`📊 Encontrados ${comments.length} comentários no arquivo local`);
      
      if (comments.length > 0) {
        // Substituir por array vazio
        fs.writeFileSync(file, JSON.stringify([], null, 2), 'utf8');
        console.log('✅ Todos os comentários deletados do arquivo local com sucesso!');
      } else {
        console.log('ℹ️ Arquivo já estava vazio');
      }
    } else {
      console.log('ℹ️ Arquivo de comentários não encontrado');
    }
  } catch (e) {
    console.log('❌ Erro ao deletar do arquivo local:', e.message);
  }
  
  console.log('🎉 Processo de deleção concluído!');
}

// Executar o script
deleteAllComments().catch(console.error);
