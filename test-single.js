console.log('🧪 Testando processamento de um site...');

// Teste com um site específico
const testSite = {
  url: 'https://www.blued.com/',
  type: 'logos',
  slug: 'blued'
};

fetch('http://localhost:3000/api/media/fetch-and-save', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testSite)
})
.then(response => {
  console.log('📡 Status:', response.status, response.statusText);
  return response.json();
})
.then(data => {
  if (data.success) {
    console.log('✅ Sucesso:', data);
  } else {
    console.log('❌ Erro:', data);
  }
})
.catch(error => {
  console.log('❌ Erro de rede:', error.message);
});
