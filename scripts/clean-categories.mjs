import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🧹 Limpando categorias de teste...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Categorias que devem ser mantidas
  const validCategories = ['todos', 'sugar', 'estilo-tinder', 'cristao', 'nicho'];

  // Buscar todas as categorias
  console.log('\n📋 Buscando categorias atuais...');
  const { data: allCategories, error: fetchError } = await supabase
    .from('categories')
    .select('*');

  if (fetchError) {
    console.log('❌ Erro ao buscar categorias:', fetchError.message);
    process.exit(1);
  }

  console.log(`📊 ${allCategories.length} categorias encontradas:`);
  allCategories.forEach(cat => {
    console.log(`   - ${cat.slug}: ${cat.title}`);
  });

  // Identificar categorias para remover
  const categoriesToRemove = allCategories.filter(cat => !validCategories.includes(cat.slug));

  if (categoriesToRemove.length === 0) {
    console.log('\n✅ Nenhuma categoria de teste encontrada para remover!');
  } else {
    console.log(`\n🗑️ Removendo ${categoriesToRemove.length} categorias de teste:`);
    categoriesToRemove.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title}`);
    });

    // Remover categorias de teste
    for (const cat of categoriesToRemove) {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('slug', cat.slug);

      if (deleteError) {
        console.log(`❌ Erro ao remover ${cat.slug}:`, deleteError.message);
      } else {
        console.log(`✅ Removida: ${cat.slug}`);
      }
    }
  }

  // Verificar resultado final
  console.log('\n🔍 Verificando resultado final...');
  const { data: finalCategories, error: finalError } = await supabase
    .from('categories')
    .select('*')
    .order('title', { ascending: true });

  if (finalError) {
    console.log('❌ Erro ao verificar resultado:', finalError.message);
  } else {
    console.log(`✅ ${finalCategories.length} categorias finais:`);
    finalCategories.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title}`);
    });
  }

  console.log('\n🎉 Limpeza concluída!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
