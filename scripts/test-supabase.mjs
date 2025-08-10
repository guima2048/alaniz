import { createClient } from '@supabase/supabase-js';
import { toISOSPLocal } from './utils.mjs';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 Testando conexão com Supabase...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Teste 1: Verificar se as tabelas existem
  console.log('\n📋 Testando tabela comments...');
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('count')
    .limit(1);
  
  if (commentsError) {
    console.log('❌ Erro na tabela comments:', commentsError.message);
  } else {
    console.log('✅ Tabela comments OK');
  }

  // Teste 2: Verificar tabela ratings
  console.log('\n📊 Testando tabela ratings...');
  const { data: ratings, error: ratingsError } = await supabase
    .from('ratings')
    .select('count')
    .limit(1);
  
  if (ratingsError) {
    console.log('❌ Erro na tabela ratings:', ratingsError.message);
  } else {
    console.log('✅ Tabela ratings OK');
  }

  // Teste 3: Inserir um comentário de teste
  console.log('\n✍️ Testando inserção de comentário...');
  const testComment = {
    slug: 'test-connection',
    name: 'Teste de Conexão',
    message: 'Este é um teste automático da conexão com Supabase',
    createdAt: toISOSPLocal()
  };

  const { data: insertData, error: insertError } = await supabase
    .from('comments')
    .insert(testComment)
    .select()
    .single();

  if (insertError) {
    console.log('❌ Erro ao inserir comentário:', insertError.message);
  } else {
    console.log('✅ Inserção de comentário OK');
    console.log('📝 ID do comentário:', insertData.id);
  }

  console.log('\n🎉 Teste de conexão concluído!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
