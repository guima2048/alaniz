import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔧 Recriando tabela categories...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Ler categorias do arquivo JSON
  const categoriesPath = path.join(process.cwd(), 'src/data/categories.json');
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  console.log(`\n📋 Categorias encontradas: ${categoriesData.length}`);
  categoriesData.forEach(cat => {
    console.log(`   - ${cat.slug}: ${cat.title} (ordem: ${cat.order})`);
  });

  // SQL para recriar a tabela
  const sql = `
    -- Remover tabela se existir
    DROP TABLE IF EXISTS public.categories CASCADE;
    
    -- Criar tabela categories com a estrutura correta
    CREATE TABLE public.categories (
      slug text PRIMARY KEY,
      title text NOT NULL,
      "order" integer
    );
    
    -- Habilitar RLS
    ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
    
    -- Políticas de acesso
    CREATE POLICY "public can read categories" ON public.categories FOR SELECT USING (true);
    CREATE POLICY "admin can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
    CREATE POLICY "admin can update categories" ON public.categories FOR UPDATE USING (true);
    CREATE POLICY "admin can delete categories" ON public.categories FOR DELETE USING (true);
  `;

  console.log('\n📋 Executando SQL para recriar tabela...');
  console.log('⚠️  Execute manualmente no Supabase SQL Editor:');
  console.log('='.repeat(50));
  console.log(sql);
  console.log('='.repeat(50));
  
  // Tentar executar via RPC (pode não funcionar)
  const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
  
  if (error) {
    console.log('❌ Erro ao executar SQL via RPC:', error.message);
    console.log('\n📝 Você precisa executar o SQL manualmente no Supabase Dashboard');
    console.log('1. Acesse: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq');
    console.log('2. Vá para SQL Editor');
    console.log('3. Cole o SQL acima');
    console.log('4. Clique em "Run"');
  } else {
    console.log('✅ Tabela recriada com sucesso!');
  }

  // Aguardar um pouco e tentar inserir as categorias
  console.log('\n⏳ Aguardando 3 segundos...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('\n📝 Inserindo categorias...');
  const { error: insertError } = await supabase
    .from('categories')
    .insert(categoriesData);

  if (insertError) {
    console.log('❌ Erro ao inserir categorias:', insertError.message);
    console.log('\n📝 Execute manualmente no Supabase SQL Editor:');
    console.log('='.repeat(50));
    console.log('INSERT INTO public.categories (slug, title, "order") VALUES');
    categoriesData.forEach((cat, index) => {
      const comma = index < categoriesData.length - 1 ? ',' : ';';
      console.log(`  ('${cat.slug}', '${cat.title}', ${cat.order})${comma}`);
    });
    console.log('='.repeat(50));
  } else {
    console.log('✅ Categorias inseridas com sucesso!');
  }

  // Verificar resultado
  console.log('\n🔍 Verificando resultado...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('categories')
    .select('*')
    .order('order', { ascending: true });

  if (verifyError) {
    console.log('❌ Erro ao verificar:', verifyError.message);
  } else {
    console.log('✅ Verificação final:');
    console.log(`   - ${verifyData.length} categorias no banco`);
    verifyData.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title} (ordem: ${cat.order})`);
    });
  }

  console.log('\n🎉 Recriação concluída!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}

