#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Usar as mesmas variáveis de ambiente do Vercel
const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 Testando conexão com Supabase (configuração Vercel)...');
console.log('URL:', url);
console.log('Anon Key:', anon.substring(0, 20) + '...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Teste 1: Verificar tabela sites
  console.log('\n📋 Testando tabela sites...');
  const { data: sites, error: sitesError } = await supabase
    .from('sites')
    .select('*')
    .order('name');
  
  if (sitesError) {
    console.log('❌ Erro na tabela sites:', sitesError.message);
  } else {
    console.log('✅ Tabela sites OK');
    console.log(`   - ${sites?.length || 0} sites encontrados`);
    sites?.forEach(site => {
      console.log(`   - ${site.name} (${site.slug})`);
    });
  }

  // Teste 2: Verificar tabela categories
  console.log('\n📊 Testando tabela categories...');
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('title');
  
  if (categoriesError) {
    console.log('❌ Erro na tabela categories:', categoriesError.message);
  } else {
    console.log('✅ Tabela categories OK');
    console.log(`   - ${categories?.length || 0} categorias encontradas`);
    categories?.forEach(cat => {
      console.log(`   - ${cat.title} (${cat.slug})`);
    });
  }

  // Teste 3: Testar inserção de site
  console.log('\n✍️ Testando inserção de site...');
  const testSite = {
    slug: 'test-vercel-connection',
    name: 'Site de Teste Vercel',
    url: 'https://teste-vercel.com',
    short_desc: 'Site para testar a conexão Vercel-Supabase',
    categories: ['todos'],
    rating_avg: 8.0,
    rating_count: 5
  };

  const { data: insertSiteData, error: insertSiteError } = await supabase
    .from('sites')
    .upsert(testSite, { onConflict: 'slug' })
    .select()
    .single();

  if (insertSiteError) {
    console.log('❌ Erro ao inserir site:', insertSiteError.message);
  } else {
    console.log('✅ Site inserido com sucesso:', insertSiteData.name);
    
    // Limpar o site de teste
    const { error: deleteError } = await supabase
      .from('sites')
      .delete()
      .eq('slug', 'test-vercel-connection');
    
    if (deleteError) {
      console.log('⚠️ Erro ao limpar site de teste:', deleteError.message);
    } else {
      console.log('✅ Site de teste removido');
    }
  }

  console.log('\n🎉 Teste concluído!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
  process.exit(1);
}
