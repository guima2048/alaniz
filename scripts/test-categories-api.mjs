const BASE_URL = 'http://localhost:3000';

console.log('🔍 Testando API de categorias...');

async function testCategoriesAPI() {
  try {
    // Teste 1: GET - Buscar categorias
    console.log('\n📋 Testando GET /api/categories...');
    const getResponse = await fetch(`${BASE_URL}/api/categories`);
    const categories = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET /api/categories OK');
      console.log(`📊 Categorias encontradas: ${categories.length}`);
      categories.forEach(cat => {
        console.log(`   - ${cat.slug}: ${cat.title}`);
      });
    } else {
      console.log('❌ GET /api/categories falhou:', getResponse.status);
    }

    // Teste 2: PUT - Criar/atualizar categoria
    console.log('\n✍️ Testando PUT /api/categories...');
    const testCategory = {
      slug: 'test-api-category',
      title: 'Categoria de Teste API'
    };

    const putResponse = await fetch(`${BASE_URL}/api/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCategory)
    });
    
    if (putResponse.ok) {
      console.log('✅ PUT /api/categories OK');
    } else {
      console.log('❌ PUT /api/categories falhou:', putResponse.status);
    }

    // Teste 3: PUT - Atualizar categoria existente
    console.log('\n✏️ Testando atualização de categoria...');
    const updateCategory = {
      slug: 'test-api-category',
      title: 'Categoria de Teste API Atualizada'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/categories`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateCategory)
    });
    
    if (updateResponse.ok) {
      console.log('✅ Atualização de categoria OK');
    } else {
      console.log('❌ Atualização de categoria falhou:', updateResponse.status);
    }

    // Teste 4: DELETE - Excluir categoria
    console.log('\n🗑️ Testando DELETE /api/categories...');
    const deleteResponse = await fetch(`${BASE_URL}/api/categories?slug=test-api-category`, {
      method: 'DELETE'
    });
    
    if (deleteResponse.ok) {
      console.log('✅ DELETE /api/categories OK');
    } else {
      console.log('❌ DELETE /api/categories falhou:', deleteResponse.status);
    }

    // Verificar se foi deletada
    console.log('\n🔍 Verificando se categoria foi deletada...');
    const finalResponse = await fetch(`${BASE_URL}/api/categories`);
    const finalCategories = await finalResponse.json();
    
    const testCategoryExists = finalCategories.find(cat => cat.slug === 'test-api-category');
    if (!testCategoryExists) {
      console.log('✅ Categoria foi deletada com sucesso');
    } else {
      console.log('❌ Categoria ainda existe após delete');
    }

    console.log('\n🎉 Teste da API concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testCategoriesAPI();
