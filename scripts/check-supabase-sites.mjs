import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

console.log('🔍 Testando conexão com Supabase...\n');

async function testSupabase() {
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('1. Testando conexão...');
    const { data, error } = await supabase
      .from('sites')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      console.log('Código:', error.code);
      console.log('Detalhes:', error.details);
      return;
    }
    
    console.log('✅ Conexão bem-sucedida');
    
    // Teste 2: Tentar buscar dados
    console.log('\n2. Testando busca de dados...');
    const { data: sites, error: sitesError } = await supabase
      .from('sites')
      .select('*')
      .limit(5);
    
    if (sitesError) {
      console.log('❌ Erro ao buscar sites:', sitesError.message);
      return;
    }
    
    console.log('✅ Sites encontrados:', sites?.length || 0);
    if (sites && sites.length > 0) {
      console.log('Primeiro site:', sites[0]);
    }
    
    // Teste 3: Verificar estrutura da tabela
    console.log('\n3. Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'sites' })
      .catch(() => ({ data: null, error: { message: 'Função não disponível' } }));
    
    if (columnsError) {
      console.log('⚠️ Não foi possível verificar estrutura:', columnsError.message);
    } else {
      console.log('✅ Estrutura da tabela:', columns);
    }
    
  } catch (error) {
    console.log('❌ Erro geral:', error.message);
  }
}

testSupabase();
