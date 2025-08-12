import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { join } from 'path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

console.log('🔄 Sincronizando sites do Supabase para arquivo local...\n');

async function syncSites() {
  try {
    // Buscar todos os sites do Supabase
    console.log('📥 Baixando sites do Supabase...');
    const { data: supabaseSites, error } = await supabase
      .from('sites')
      .select('*')
      .order('name');
    
    if (error) {
      console.log('❌ Erro ao buscar sites:', error.message);
      return;
    }
    
    if (!supabaseSites || supabaseSites.length === 0) {
      console.log('❌ Nenhum site encontrado no Supabase');
      return;
    }
    
    console.log(`✅ ${supabaseSites.length} sites encontrados no Supabase`);
    
    // Salvar no arquivo local
    const localPath = join(process.cwd(), 'src', 'data', 'sites.json');
    writeFileSync(localPath, JSON.stringify(supabaseSites, null, 2), 'utf8');
    
    console.log(`💾 Sites salvos em: ${localPath}`);
    console.log(`📊 Total de sites sincronizados: ${supabaseSites.length}`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de sites sincronizados:');
    supabaseSites.slice(0, 5).forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.slug})`);
    });
    
    if (supabaseSites.length > 5) {
      console.log(`... e mais ${supabaseSites.length - 5} sites`);
    }
    
    console.log('\n✅ Sincronização concluída com sucesso!');
    
  } catch (error) {
    console.log('❌ Erro durante sincronização:', error.message);
  }
}

syncSites();
