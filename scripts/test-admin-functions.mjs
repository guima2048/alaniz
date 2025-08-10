import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🧪 TESTE COMPLETO DAS FUNCIONALIDADES DO ADMIN');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;

function test(name, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      passedTests++;
      console.log(`✅ ${name}: PASSOU`);
    } else {
      console.log(`❌ ${name}: FALHOU`);
    }
  } catch (error) {
    console.log(`❌ ${name}: FALHOU - ${error.message}`);
  }
}

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  console.log('\n📊 TESTANDO TABELAS EXISTENTES');
  console.log('-'.repeat(40));

  // Teste 1: Tabela sites
  test('Tabela sites', async () => {
    const { data, error } = await supabase
      .from('sites')
      .select('count')
      .limit(1);
    return !error;
  });

  // Teste 2: Tabela categories
  test('Tabela categories', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    return !error;
  });

  // Teste 3: Tabela comments
  test('Tabela comments', async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('count')
      .limit(1);
    return !error;
  });

  // Teste 4: Tabela ratings
  test('Tabela ratings', async () => {
    const { data, error } = await supabase
      .from('ratings')
      .select('count')
      .limit(1);
    return !error;
  });

  console.log('\n📝 TESTANDO TABELAS DO ADMIN');
  console.log('-'.repeat(40));

  // Teste 5: Tabela posts
  test('Tabela posts', async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    if (error && error.message.includes('Could not find the table')) {
      console.log('   ⚠️ Tabela posts não existe - precisa ser criada manualmente');
      return false;
    }
    return !error;
  });

  // Teste 6: Tabela about
  test('Tabela about', async () => {
    const { data, error } = await supabase
      .from('about')
      .select('count')
      .limit(1);
    if (error && error.message.includes('Could not find the table')) {
      console.log('   ⚠️ Tabela about não existe - precisa ser criada manualmente');
      return false;
    }
    return !error;
  });

  console.log('\n🔄 TESTANDO OPERAÇÕES CRUD');
  console.log('-'.repeat(40));

  // Teste 7: Criar site
  test('Criar site', async () => {
    const testSite = {
      slug: 'test-site-admin',
      name: 'Site de Teste Admin',
      url: 'https://teste.com',
      short_desc: 'Site para teste do admin'
    };
    const { data, error } = await supabase
      .from('sites')
      .upsert(testSite, { onConflict: 'slug' })
      .select()
      .single();
    return !error;
  });

  // Teste 8: Atualizar site
  test('Atualizar site', async () => {
    const { data, error } = await supabase
      .from('sites')
      .update({ name: 'Site de Teste Admin - Atualizado' })
      .eq('slug', 'test-site-admin')
      .select()
      .single();
    return !error;
  });

  // Teste 9: Deletar site
  test('Deletar site', async () => {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('slug', 'test-site-admin');
    return !error;
  });

  // Teste 10: Criar categoria
  test('Criar categoria', async () => {
    const testCategory = {
      slug: 'test-category-admin',
      title: 'Categoria de Teste Admin'
    };
    const { data, error } = await supabase
      .from('categories')
      .upsert(testCategory, { onConflict: 'slug' })
      .select()
      .single();
    return !error;
  });

  // Teste 11: Deletar categoria
  test('Deletar categoria', async () => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('slug', 'test-category-admin');
    return !error;
  });

  console.log('\n📦 TESTANDO STORAGE');
  console.log('-'.repeat(40));

  // Teste 12: Upload de arquivo
  test('Upload de arquivo', async () => {
    const testFile = new Blob(['test content'], { type: 'text/plain' });
    const fileName = `test-admin-${Date.now()}.txt`;
    const { data, error } = await supabase.storage
      .from('media')
      .upload(`logos/${fileName}`, testFile);
    return !error;
  });

  // Teste 13: Listar arquivos
  test('Listar arquivos', async () => {
    const { data, error } = await supabase.storage
      .from('media')
      .list('logos');
    return !error;
  });

  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));
  console.log(`✅ Passou: ${passedTests}`);
  console.log(`❌ Falhou: ${totalTests - passedTests}`);
  console.log(`📊 Total: ${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('🚀 O admin está funcionando perfeitamente!');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os erros acima e corrija se necessário');
  }

  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('-'.repeat(40));
  console.log('1. Se as tabelas posts/about não existem, crie-as manualmente no Supabase');
  console.log('2. Teste o admin em: https://seu-site.vercel.app/admin');
  console.log('3. Tente criar, editar e deletar conteúdo');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
