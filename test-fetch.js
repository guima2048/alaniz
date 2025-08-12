const fetch = require('node-fetch');

async function testFetchAndSave() {
  try {
    console.log('🧪 Testando API fetch-and-save...');
    
    const response = await fetch('http://localhost:3000/api/media/fetch-and-save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://www.blued.com/',
        type: 'logos',
        slug: 'blued'
      })
    });
    
    console.log('📡 Status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sucesso:', data);
    } else {
      const error = await response.json();
      console.log('❌ Erro:', error);
    }
  } catch (error) {
    console.log('❌ Erro de rede:', error.message);
  }
}

testFetchAndSave();
