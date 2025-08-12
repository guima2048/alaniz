import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 Testando tabela categories (sem coluna order)...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Teste 1: Verificar se a tabela categories existe (sem order)
  console.log('\n📋 Testando tabela categories...');
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('slug, title')
    .order('title', { ascending: true });
  
  if (categoriesError) {
    console.log('❌ Erro na tabela categories:', categoriesError.message);
  } else {
    console.log('✅ Tabela categories OK');
    console.log(`📊 Categorias encontradas: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   - ${cat.slug}: ${cat.title}`);
    });
  }

  // Teste 2: Tentar inserir uma categoria de teste (sem order)
  console.log('\n✍️ Testando inserção de categoria...');
  const testCategory = {
    slug: 'test-category',
    title: 'Categoria de Teste'
  };

  const { data: insertData, error: insertError } = await supabase
    .from('categories')
    .upsert(testCategory, { onConflict: 'slug' })
    .select()
    .single();

  if (insertError) {
    console.log('❌ Erro ao inserir categoria:', insertError.message);
  } else {
    console.log('✅ Inserção de categoria OK');
    console.log('📝 Categoria inserida:', insertData);
  }

  // Teste 3: Tentar atualizar uma categoria (sem order)
  console.log('\n✏️ Testando atualização de categoria...');
  const { data: updateData, error: updateError } = await supabase
    .from('categories')
    .update({ title: 'Categoria de Teste Atualizada' })
    .eq('slug', 'test-category')
    .select()
    .single();

  if (updateError) {
    console.log('❌ Erro ao atualizar categoria:', updateError.message);
  } else {
    console.log('✅ Atualização de categoria OK');
    console.log('📝 Categoria atualizada:', updateData);
  }

  // Teste 4: Tentar deletar a categoria de teste
  console.log('\n🗑️ Testando exclusão de categoria...');
  const { error: deleteError } = await supabase
    .from('categories')
    .delete()
    .eq('slug', 'test-category');

  if (deleteError) {
    console.log('❌ Erro ao deletar categoria:', deleteError.message);
  } else {
    console.log('✅ Exclusão de categoria OK');
  }

  console.log('\n🎉 Teste de categorias concluído!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}




