console.log('🧪 Testando se o servidor está rodando...');

// Teste simples de conectividade
fetch('http://localhost:3000/api/admin/sites-list')
  .then(response => {
    console.log('✅ Servidor respondendo:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📊 Sites carregados:', data.length);
    console.log('📋 Primeiro site:', data[0]?.name);
  })
  .catch(error => {
    console.log('❌ Erro:', error.message);
  });
