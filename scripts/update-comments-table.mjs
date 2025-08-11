import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔄 Atualizando tabela de comentários no Supabase...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Verificar comentários existentes
  console.log('\n📋 Verificando comentários existentes...');
  const { data: existingComments, error: fetchError } = await supabase
    .from('comments')
    .select('*')
    .order('createdAt', { ascending: false });

  if (fetchError) {
    console.log('❌ Erro ao buscar comentários:', fetchError.message);
    process.exit(1);
  }

  console.log(`   - ${existingComments?.length || 0} comentários encontrados`);

  // Atualizar comentários existentes para incluir status
  if (existingComments && existingComments.length > 0) {
    console.log('\n📝 Atualizando comentários existentes...');
    
    for (const comment of existingComments) {
      if (!comment.status) {
        const { error: updateError } = await supabase
          .from('comments')
          .update({ status: 'approved' })
          .eq('id', comment.id);
        
        if (updateError) {
          console.log(`❌ Erro ao atualizar comentário ${comment.id}:`, updateError.message);
        } else {
          console.log(`✅ Comentário ${comment.id} atualizado para 'approved'`);
        }
      }
    }
  }

  // Verificar resultado final
  console.log('\n✅ Verificação final...');
  const { data: finalComments, error: finalError } = await supabase
    .from('comments')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(5);

  if (finalError) {
    console.log('❌ Erro ao verificar comentários finais:', finalError.message);
    process.exit(1);
  }

  console.log(`   - ${finalComments?.length || 0} comentários verificados`);
  
  if (finalComments && finalComments.length > 0) {
    console.log('\n📋 Últimos comentários:');
    finalComments.forEach(comment => {
      const status = comment.status || 'approved';
      console.log(`   - ${comment.name}: "${comment.message.substring(0, 50)}..." (${status})`);
    });
  }

  console.log('\n🎉 Atualização concluída com sucesso!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Acesse: /admin/comentarios');
  console.log('2. Teste a moderação de comentários');
  console.log('3. Verifique se os comentários aparecem corretamente');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
  process.exit(1);
}
