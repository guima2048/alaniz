import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔧 Corrigindo tabela categories...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // SQL para adicionar a coluna order
  const sql = `
    ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS "order" integer;
    
    -- Atualizar categorias existentes com ordem baseada na posição atual
    UPDATE public.categories
    SET "order" = CASE 
      WHEN slug = 'todos' THEN 1
      WHEN slug = 'sugar' THEN 2
      WHEN slug = 'estilo-tinder' THEN 3
      WHEN slug = 'cristao' THEN 4
      WHEN slug = 'nicho' THEN 5
      ELSE 999
    END
    WHERE "order" IS NULL;
  `;

  console.log('\n📋 Executando SQL para adicionar coluna order...');
  
  // Executar o SQL
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.log('❌ Erro ao executar SQL:', error.message);
    console.log('\n📝 Execute manualmente no Supabase SQL Editor:');
    console.log('='.repeat(50));
    console.log(sql);
    console.log('='.repeat(50));
  } else {
    console.log('✅ Coluna order adicionada com sucesso!');
  }

  // Verificar se funcionou
  console.log('\n🔍 Verificando resultado...');
  const { data: categories, error: checkError } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true });
  
  if (checkError) {
    console.log('❌ Erro ao verificar:', checkError.message);
  } else {
    console.log('✅ Tabela categories corrigida!');
    console.log(`📊 Categorias encontradas: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title} (ordem: ${cat.order || 'N/A'})`);
    });
  }

  console.log('\n🎉 Correção concluída!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}


