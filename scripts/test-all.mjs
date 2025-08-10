import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🧪 TESTE COMPLETO DO PROJETO');
console.log('='.repeat(60));

const results = {
  database: { passed: 0, failed: 0, tests: [] },
  storage: { passed: 0, failed: 0, tests: [] },
  files: { passed: 0, failed: 0, tests: [] },
  config: { passed: 0, failed: 0, tests: [] }
};

function logTest(category, testName, passed, details = '') {
  const status = passed ? '✅' : '❌';
  const result = passed ? 'PASSOU' : 'FALHOU';
  console.log(`${status} ${testName}: ${result}`);
  if (details) console.log(`   ${details}`);
  
  if (passed) {
    results[category].passed++;
  } else {
    results[category].failed++;
  }
  results[category].tests.push({ name: testName, passed, details });
}

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // ===== TESTES DE BANCO DE DADOS =====
  console.log('\n📊 TESTANDO BANCO DE DADOS');
  console.log('-'.repeat(30));

  // Teste 1: Tabela comments
  try {
    const { data: comments, error } = await supabase
      .from('comments')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('database', 'Tabela comments', true, `${comments?.length || 0} registros`);
  } catch (e) {
    logTest('database', 'Tabela comments', false, e.message);
  }

  // Teste 2: Tabela ratings
  try {
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('database', 'Tabela ratings', true, `${ratings?.length || 0} registros`);
  } catch (e) {
    logTest('database', 'Tabela ratings', false, e.message);
  }

  // Teste 3: Tabela sites
  try {
    const { data: sites, error } = await supabase
      .from('sites')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('database', 'Tabela sites', true, `${sites?.length || 0} registros`);
  } catch (e) {
    logTest('database', 'Tabela sites', false, e.message);
  }

  // Teste 4: Tabela categories
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    logTest('database', 'Tabela categories', true, `${categories?.length || 0} registros`);
  } catch (e) {
    logTest('database', 'Tabela categories', false, e.message);
  }

  // Teste 5: Inserir comentário de teste
  try {
    const testComment = {
      slug: 'test-automated',
      name: 'Teste Automático',
      message: 'Teste automático do sistema',
      createdAt: new Date().toISOString()
    };

    const { data: insertData, error } = await supabase
      .from('comments')
      .insert(testComment)
      .select()
      .single();

    if (error) throw error;
    logTest('database', 'Inserir comentário', true, `ID: ${insertData.id}`);

    // Limpar comentário de teste
    await supabase.from('comments').delete().eq('id', insertData.id);
  } catch (e) {
    logTest('database', 'Inserir comentário', false, e.message);
  }

  // ===== TESTES DE STORAGE =====
  console.log('\n📦 TESTANDO STORAGE');
  console.log('-'.repeat(30));

  // Teste 1: Verificar bucket media (teste indireto)
  try {
    // Teste indireto: tentar listar arquivos no bucket
    const { data, error } = await supabase.storage.from('media').list('logos');
    if (error) throw error;
    logTest('storage', 'Bucket media', true, 'Bucket acessível (teste indireto)');
  } catch (e) {
    logTest('storage', 'Bucket media', false, e.message);
  }

  // Teste 2: Verificar pastas
  const folders = ['logos', 'covers', 'heroes'];
  for (const folder of folders) {
    try {
      const { data, error } = await supabase.storage.from('media').list(folder);
      if (error) throw error;
      logTest('storage', `Pasta ${folder}`, true, `${data?.length || 0} arquivos`);
    } catch (e) {
      logTest('storage', `Pasta ${folder}`, false, e.message);
    }
  }

  // Teste 3: Upload de teste
  try {
    const testContent = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGVzdGU8L3RleHQ+PC9zdmc+';
    const testBuffer = Buffer.from(testContent.split(',')[1], 'base64');
    const testFilename = `test-${Date.now()}.svg`;

    const { data: uploadData, error } = await supabase.storage
      .from('media')
      .upload(`logos/${testFilename}`, testBuffer, {
        contentType: 'image/svg+xml',
        upsert: false,
      });

    if (error) throw error;
    logTest('storage', 'Upload de arquivo', true, `Arquivo: ${uploadData.path}`);

    // Teste 4: URL pública
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(`logos/${testFilename}`);
    logTest('storage', 'URL pública', true, urlData.publicUrl);

    // Teste 5: Delete
    const { error: deleteError } = await supabase.storage.from('media').remove([`logos/${testFilename}`]);
    if (deleteError) throw deleteError;
    logTest('storage', 'Delete de arquivo', true);

  } catch (e) {
    logTest('storage', 'Operações de arquivo', false, e.message);
  }

  // ===== TESTES DE ARQUIVOS =====
  console.log('\n📁 TESTANDO ARQUIVOS');
  console.log('-'.repeat(30));

  // Teste 1: .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  const envExists = fs.existsSync(envPath);
  logTest('files', '.env.local', envExists, envExists ? 'Arquivo encontrado' : 'Arquivo não encontrado');

  // Teste 2: package.json
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageExists = fs.existsSync(packagePath);
  logTest('files', 'package.json', packageExists, packageExists ? 'Arquivo encontrado' : 'Arquivo não encontrado');

  // Teste 3: Dependências
  if (packageExists) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const hasSupabase = packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js'];
      logTest('files', 'Dependência @supabase/supabase-js', hasSupabase, hasSupabase ? 'Instalada' : 'Não instalada');
    } catch (e) {
      logTest('files', 'Dependência @supabase/supabase-js', false, e.message);
    }
  }

  // Teste 4: Arquivos de dados locais
  const dataFiles = ['sites.json', 'categories.json', 'ratings.json', 'comments.json'];
  for (const file of dataFiles) {
    const filePath = path.join(process.cwd(), 'src', 'data', file);
    const exists = fs.existsSync(filePath);
    logTest('files', `Arquivo ${file}`, exists, exists ? 'Encontrado' : 'Não encontrado');
  }

  // ===== TESTES DE CONFIGURAÇÃO =====
  console.log('\n⚙️ TESTANDO CONFIGURAÇÃO');
  console.log('-'.repeat(30));

  // Teste 1: Variáveis de ambiente
  if (envExists) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
    const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    const hasBaseUrl = envContent.includes('NEXT_PUBLIC_BASE_URL');

    logTest('config', 'NEXT_PUBLIC_SUPABASE_URL', hasSupabaseUrl);
    logTest('config', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', hasSupabaseKey);
    logTest('config', 'NEXT_PUBLIC_BASE_URL', hasBaseUrl);
  } else {
    logTest('config', 'Variáveis de ambiente', false, '.env.local não encontrado');
  }

  // Teste 2: Arquivos de configuração
  const configFiles = ['next.config.ts', 'tailwind.config.ts', 'tsconfig.json'];
  for (const file of configFiles) {
    const filePath = path.join(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    logTest('config', `Arquivo ${file}`, exists);
  }

  // ===== RESUMO FINAL =====
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(60));

  const categories = ['database', 'storage', 'files', 'config'];
  let totalPassed = 0;
  let totalFailed = 0;

  for (const category of categories) {
    const { passed, failed, tests } = results[category];
    totalPassed += passed;
    totalFailed += failed;
    
    const categoryName = {
      database: '📊 Banco de Dados',
      storage: '📦 Storage',
      files: '📁 Arquivos',
      config: '⚙️ Configuração'
    }[category];

    console.log(`\n${categoryName}:`);
    console.log(`  ✅ Passou: ${passed}`);
    console.log(`  ❌ Falhou: ${failed}`);
    console.log(`  📊 Total: ${passed + failed}`);
    
    if (failed > 0) {
      console.log('  ❌ Testes que falharam:');
      tests.filter(t => !t.passed).forEach(test => {
        console.log(`    - ${test.name}: ${test.details}`);
      });
    }
  }

  console.log('\n🎯 RESULTADO GERAL:');
  console.log(`  ✅ Total passou: ${totalPassed}`);
  console.log(`  ❌ Total falhou: ${totalFailed}`);
  console.log(`  📊 Total testes: ${totalPassed + totalFailed}`);
  
  const successRate = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
  console.log(`  📈 Taxa de sucesso: ${successRate}%`);

  if (totalFailed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('🚀 O projeto está pronto para produção!');
  } else {
    console.log('\n⚠️ ALGUNS TESTES FALHARAM');
    console.log('🔧 Verifique os erros acima antes de prosseguir');
  }

} catch (error) {
  console.error('❌ Erro geral nos testes:', error.message);
}
