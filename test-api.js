// Usar fetch nativo do Node.js

async function testAPI() {
  try {
    console.log('Testando API de sites...');
    const response = await fetch('http://localhost:3000/api/admin/sites-list');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando!');
      console.log(`📊 Total de sites: ${data.length}`);
      console.log('📋 Primeiros 3 sites:');
      data.slice(0, 3).forEach(site => {
        console.log(`  - ${site.name} (${site.slug})`);
      });
    } else {
      console.log('❌ Erro na API:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Erro ao testar API:', error.message);
  }
}

testAPI();
