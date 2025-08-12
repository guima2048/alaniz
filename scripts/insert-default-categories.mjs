import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('📝 Inserindo categorias padrão...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Ler categorias do arquivo JSON
  const categoriesPath = path.join(process.cwd(), 'src/data/categories.json');
  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));

  console.log(`\n📋 Categorias encontradas: ${categoriesData.length}`);
  categoriesData.forEach(cat => {
    console.log(`   - ${cat.slug}: ${cat.title}`);
  });

  // Preparar dados para inserção (sem a coluna order)
  const categoriesToInsert = categoriesData.map(cat => ({
    slug: cat.slug,
    title: cat.title
  }));

  console.log('\n📝 Inserindo categorias no Supabase...');
  const { error: insertError } = await supabase
    .from('categories')
    .insert(categoriesToInsert);

  if (insertError) {
    console.log('❌ Erro ao inserir categorias:', insertError.message);
  } else {
    console.log('✅ Categorias inseridas com sucesso!');
  }

  // Verificar resultado
  console.log('\n🔍 Verificando resultado...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('categories')
    .select('*')
    .order('title', { ascending: true });

  if (verifyError) {
    console.log('❌ Erro ao verificar:', verifyError.message);
  } else {
    console.log('✅ Verificação final:');
    console.log(`   - ${verifyData.length} categorias no banco`);
    verifyData.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title}`);
    });
  }

  console.log('\n🎉 Inserção concluída!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}



