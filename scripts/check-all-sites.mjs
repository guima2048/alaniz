import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

const supabase = createClient(url, anon, {
  auth: { persistSession: false },
});

console.log('🔍 Verificando todos os sites...\n');

async function checkAllSites() {
  try {
    // 1. Sites no arquivo local
    console.log('📁 SITES NO ARQUIVO LOCAL:');
    const localPath = join(process.cwd(), 'src', 'data', 'sites.json');
    const localData = readFileSync(localPath, 'utf8');
    const localSites = JSON.parse(localData);
    
    console.log(`Total: ${localSites.length} sites`);
    localSites.forEach((site, index) => {
      console.log(`${index + 1}. ${site.name} (${site.slug})`);
    });
    
    // 2. Sites no Supabase
    console.log('\n☁️ SITES NO SUPABASE:');
    const { data: supabaseSites, error } = await supabase
      .from('sites')
      .select('*')
      .order('name');
    
    if (error) {
      console.log('❌ Erro ao buscar no Supabase:', error.message);
      return;
    }
    
    console.log(`Total: ${supabaseSites?.length || 0} sites`);
    if (supabaseSites) {
      supabaseSites.forEach((site, index) => {
        console.log(`${index + 1}. ${site.name} (${site.slug})`);
      });
    }
    
    // 3. Comparação
    console.log('\n🔍 COMPARAÇÃO:');
    const localSlugs = new Set(localSites.map(s => s.slug));
    const supabaseSlugs = new Set(supabaseSites?.map(s => s.slug) || []);
    
    const onlyInSupabase = supabaseSites?.filter(s => !localSlugs.has(s.slug)) || [];
    const onlyInLocal = localSites.filter(s => !supabaseSlugs.has(s.slug));
    
    if (onlyInSupabase.length > 0) {
      console.log(`\n📤 Sites apenas no Supabase (${onlyInSupabase.length}):`);
      onlyInSupabase.forEach(site => {
        console.log(`- ${site.name} (${site.slug})`);
      });
    }
    
    if (onlyInLocal.length > 0) {
      console.log(`\n📥 Sites apenas no arquivo local (${onlyInLocal.length}):`);
      onlyInLocal.forEach(site => {
        console.log(`- ${site.name} (${site.slug})`);
      });
    }
    
    if (onlyInSupabase.length === 0 && onlyInLocal.length === 0) {
      console.log('✅ Sites sincronizados entre local e Supabase');
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

checkAllSites();
