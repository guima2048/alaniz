// Teste da API local
const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🔍 Testando API local...');
  
  try {
    // Teste 1: Sites
    console.log('\n📋 Testando /api/sites...');
    const sitesResponse = await fetch(`${BASE_URL}/api/sites`);
    const sitesData = await sitesResponse.json();
    console.log(`✅ Sites: ${sitesData.length} encontrados`);
    sitesData.slice(0, 3).forEach(site => {
      console.log(`   - ${site.name} (${site.slug})`);
    });
    
    // Teste 2: Categories
    console.log('\n📊 Testando /api/categories...');
    const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log(`✅ Categorias: ${categoriesData.length} encontradas`);
    categoriesData.forEach(cat => {
      console.log(`   - ${cat.title} (${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testAPI();
