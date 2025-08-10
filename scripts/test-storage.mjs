import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 Testando Supabase Storage...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Teste 1: Verificar se o bucket existe
  console.log('\n📦 Testando bucket "media"...');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.log('❌ Erro ao listar buckets:', bucketsError.message);
  } else {
    const mediaBucket = buckets?.find(b => b.name === 'media');
    if (mediaBucket) {
      console.log('✅ Bucket "media" encontrado');
      console.log(`   - Public: ${mediaBucket.public}`);
      console.log(`   - File size limit: ${mediaBucket.file_size_limit} bytes`);
    } else {
      console.log('❌ Bucket "media" não encontrado');
    }
  }

  // Teste 2: Verificar pastas no bucket
  console.log('\n📁 Testando pastas no bucket...');
  const folders = ['logos', 'covers', 'heroes'];
  
  for (const folder of folders) {
    const { data, error } = await supabase.storage.from('media').list(folder);
    if (error) {
      console.log(`❌ Erro na pasta ${folder}:`, error.message);
    } else {
      console.log(`✅ Pasta ${folder} OK (${data?.length || 0} arquivos)`);
    }
  }

  // Teste 3: Testar upload de arquivo de teste
  console.log('\n📤 Testando upload...');
  const testContent = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGVzdGU8L3RleHQ+PC9zdmc+';
  const testBuffer = Buffer.from(testContent.split(',')[1], 'base64');
  const testFilename = `test-${Date.now()}.svg`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(`logos/${testFilename}`, testBuffer, {
      contentType: 'image/svg+xml',
      upsert: false,
    });

  if (uploadError) {
    console.log('❌ Erro no upload:', uploadError.message);
  } else {
    console.log('✅ Upload OK');
    console.log('📝 Arquivo:', uploadData.path);
    
    // Teste 4: Gerar URL pública
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(`logos/${testFilename}`);
    console.log('🔗 URL pública:', urlData.publicUrl);
    
    // Teste 5: Deletar arquivo de teste
    const { error: deleteError } = await supabase.storage.from('media').remove([`logos/${testFilename}`]);
    if (deleteError) {
      console.log('❌ Erro ao deletar:', deleteError.message);
    } else {
      console.log('✅ Delete OK');
    }
  }

  console.log('\n🎉 Teste do Storage concluído!');
  console.log('\n🚀 Agora você pode:');
  console.log('   - Fazer upload de imagens no admin');
  console.log('   - As imagens vão para Supabase Storage');
  console.log('   - URLs públicas automáticas');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
