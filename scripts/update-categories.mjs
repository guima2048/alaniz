import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔄 Atualizando categorias no Supabase...');

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

  // Limpar tabela categories
  console.log('\n🧹 Limpando tabela categories...');
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .neq('slug', ''); // Deletar todos

  if (deleteError) {
    console.log('❌ Erro ao limpar tabela:', deleteError.message);
    process.exit(1);
  }
  console.log('✅ Tabela categories limpa!');

  // Inserir novas categorias
  console.log('\n📝 Inserindo novas categorias...');
  const { error: insertError } = await supabase
    .from('categories')
    .insert(categoriesData);

  if (insertError) {
    console.log('❌ Erro ao inserir categorias:', insertError.message);
    process.exit(1);
  }
  console.log('✅ Categorias inseridas com sucesso!');

  // Verificar resultado
  const { data: verifyData, error: verifyError } = await supabase
    .from('categories')
    .select('*')
    .order('title');

  if (verifyError) {
    console.log('❌ Erro ao verificar:', verifyError.message);
    process.exit(1);
  }

  console.log('\n✅ Verificação final:');
  console.log(`   - ${verifyData.length} categorias no banco`);
  verifyData.forEach(cat => {
    console.log(`   - ${cat.slug}: ${cat.title}`);
  });

  console.log('\n🎉 Atualização concluída com sucesso!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
