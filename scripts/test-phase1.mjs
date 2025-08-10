import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 Testando FASE 1 - Sites e Categories...');

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
    slug: 'test-site-phase1',
    name: 'Site de Teste Fase 1',
    url: 'https://teste.com',
    short_desc: 'Site para testar a integração',
    categories: ['sugar'],
    price_min: 99.9,
    price_model: 'mensal',
    style: 'teste',
    audience: 'teste',
    privacy_level: 'alto',
    editorial_score: 8.5,
    rating_avg: 8.0,
    rating_count: 10,
    features: ['teste1', 'teste2']
  };

  const { data: insertSiteData, error: insertSiteError } = await supabase
    .from('sites')
    .upsert(testSite, { onConflict: 'slug' })
    .select()
    .single();

  if (insertSiteError) {
    console.log('❌ Erro ao inserir site:', insertSiteError.message);
  } else {
    console.log('✅ Inserção de site OK');
    console.log('📝 ID do site:', insertSiteData.slug);
  }

  // Teste 4: Testar inserção de categoria
  console.log('\n📝 Testando inserção de categoria...');
  const testCategory = {
    slug: 'test-cat-phase1',
    title: 'Categoria de Teste Fase 1'
  };

  const { data: insertCatData, error: insertCatError } = await supabase
    .from('categories')
    .upsert(testCategory, { onConflict: 'slug' })
    .select()
    .single();

  if (insertCatError) {
    console.log('❌ Erro ao inserir categoria:', insertCatError.message);
  } else {
    console.log('✅ Inserção de categoria OK');
    console.log('📝 ID da categoria:', insertCatData.slug);
  }

  console.log('\n🎉 Teste da FASE 1 concluído!');
  console.log('\n🚀 Agora você pode:');
  console.log('   - Acessar http://localhost:3000/admin');
  console.log('   - Testar admin de sites e categorias');
  console.log('   - Verificar se os dados aparecem no Supabase');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
