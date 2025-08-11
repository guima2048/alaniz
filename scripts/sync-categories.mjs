import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔄 Sincronizando categorias do banco com arquivo local...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Buscar categorias do banco
  console.log('\n📋 Buscando categorias do Supabase...');
  const { data: dbCategories, error: dbError } = await supabase
    .from('categories')
    .select('*')
    .order('title', { ascending: true });

  if (dbError) {
    console.log('❌ Erro ao buscar categorias do banco:', dbError.message);
    process.exit(1);
  }

  console.log(`✅ ${dbCategories.length} categorias encontradas no banco:`);
  dbCategories.forEach(cat => {
    console.log(`   - ${cat.slug}: ${cat.title}`);
  });

  // Preparar dados para o arquivo local (incluir order se disponível)
  const categoriesForFile = dbCategories.map(cat => ({
    slug: cat.slug,
    title: cat.title,
    order: cat.order || undefined
  }));

  // Ordenar por order se disponível, senão por título
  categoriesForFile.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return (a.title || "").localeCompare(b.title || "");
  });

  // Caminho do arquivo local
  const categoriesPath = path.join(process.cwd(), 'src/data/categories.json');

  // Salvar no arquivo local
  console.log('\n📝 Salvando no arquivo local...');
  fs.writeFileSync(categoriesPath, JSON.stringify(categoriesForFile, null, 2));

  console.log('✅ Arquivo local atualizado!');
  console.log(`📁 Caminho: ${categoriesPath}`);

  // Verificar se foi salvo corretamente
  console.log('\n🔍 Verificando arquivo salvo...');
  const savedData = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
  console.log(`✅ ${savedData.length} categorias no arquivo local:`);
  savedData.forEach(cat => {
    console.log(`   - ${cat.slug}: ${cat.title}${cat.order ? ` (ordem: ${cat.order})` : ''}`);
  });

  console.log('\n🎉 Sincronização concluída com sucesso!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}

