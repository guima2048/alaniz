import { readFileSync } from 'fs';
import { join } from 'path';

console.log('🔍 Testando admin de sites...\n');

// Teste 1: Verificar se o arquivo de sites existe e é válido
try {
  const sitesPath = join(process.cwd(), 'src', 'data', 'sites.json');
  const sitesData = readFileSync(sitesPath, 'utf8');
  const sites = JSON.parse(sitesData);
  
  console.log('✅ Arquivo sites.json carregado com sucesso');
  console.log(`📊 Total de sites: ${sites.length}`);
  
  // Verificar se há slugs duplicados
  const slugs = sites.map(s => s.slug);
  const uniqueSlugs = new Set(slugs);
  
  if (slugs.length !== uniqueSlugs.size) {
    console.log('❌ ERRO: Há slugs duplicados!');
    const duplicates = slugs.filter((slug, index) => slugs.indexOf(slug) !== index);
    console.log('Slugs duplicados:', duplicates);
  } else {
    console.log('✅ Todos os slugs são únicos');
  }
  
  // Verificar estrutura dos sites
  sites.forEach((site, index) => {
    if (!site.slug || !site.name) {
      console.log(`❌ Site ${index} está incompleto:`, site);
    }
  });
  
} catch (error) {
  console.log('❌ Erro ao carregar sites.json:', error.message);
}

// Teste 2: Verificar se as APIs estão funcionando
console.log('\n🔍 Testando APIs...');

const testAPI = async (url) => {
  try {
    const response = await fetch(`http://localhost:3000${url}`);
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${url}: OK (${Array.isArray(data) ? data.length : 'data'} items)`);
      return true;
    } else {
      console.log(`❌ ${url}: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url}: ${error.message}`);
    return false;
  }
};

// Testar APIs principais
await testAPI('/api/sites');
await testAPI('/api/media/logos');
await testAPI('/api/media/covers');
await testAPI('/api/media/heroes');
await testAPI('/api/categories');

console.log('\n🎯 Teste concluído!');
