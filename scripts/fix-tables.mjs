import { createClient } from '@supabase/supabase-js';
import { toISOSPLocal } from './utils.mjs';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔧 Corrigindo estrutura das tabelas...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Recriar tabela comments com estrutura correta
  console.log('\n📋 Recriando tabela comments...');
  
  // Primeiro, dropar a tabela se existir
  await supabase.rpc('exec_sql', { sql: 'DROP TABLE IF EXISTS public.comments CASCADE;' });
  
  // Criar tabela com estrutura correta
  const createCommentsSQL = `
    CREATE TABLE public.comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      slug text NOT NULL,
      name text NOT NULL,
      message text NOT NULL,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    );
    
    CREATE INDEX IF NOT EXISTS comments_slug_idx ON public.comments(slug);
    
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "public can read comments" ON public.comments FOR SELECT USING (true);
    CREATE POLICY "public can insert comments" ON public.comments FOR INSERT WITH CHECK (true);
  `;
  
  const { error: createError } = await supabase.rpc('exec_sql', { sql: createCommentsSQL });
  
  if (createError) {
    console.log('❌ Erro ao criar tabela comments:', createError.message);
  } else {
    console.log('✅ Tabela comments recriada com sucesso!');
  }

  // Testar inserção
  console.log('\n✍️ Testando inserção...');
  const testComment = {
    slug: 'test-fix',
    name: 'Teste de Correção',
    message: 'Teste após correção da estrutura',
    createdAt: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from('comments')
    .insert(testComment)
    .select()
    .single();

  if (insertError) {
    console.log('❌ Erro ao inserir:', insertError.message);
  } else {
    console.log('✅ Inserção funcionando!');
    console.log('📝 ID:', insertData.id);
  }

  console.log('\n🎉 Correção concluída!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
