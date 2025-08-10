import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 VERIFICAÇÃO DETALHADA DAS TABELAS DO ADMIN');
console.log('='.repeat(60));

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Teste 1: Verificar tabela posts
  console.log('\n📝 Testando tabela posts...');
  try {
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
    
    if (postsError) {
      console.log('❌ Erro na tabela posts:', postsError.message);
    } else {
      console.log('✅ Tabela posts existe e está funcionando!');
      console.log(`📊 Registros encontrados: ${posts?.length || 0}`);
    }
  } catch (e) {
    console.log('❌ Erro ao acessar tabela posts:', e.message);
  }

  // Teste 2: Verificar tabela about
  console.log('\nℹ️ Testando tabela about...');
  try {
    const { data: about, error: aboutError } = await supabase
      .from('about')
      .select('*')
      .limit(1);
    
    if (aboutError) {
      console.log('❌ Erro na tabela about:', aboutError.message);
    } else {
      console.log('✅ Tabela about existe e está funcionando!');
      console.log(`📊 Registros encontrados: ${about?.length || 0}`);
    }
  } catch (e) {
    console.log('❌ Erro ao acessar tabela about:', e.message);
  }

  // Teste 3: Tentar inserir post
  console.log('\n✍️ Testando inserção de post...');
  try {
    const testPost = {
      slug: 'test-verification',
      title: 'Post de Verificação',
      excerpt: 'Teste de verificação das funcionalidades',
      content: 'Este é um post de teste para verificar se o sistema está funcionando corretamente.',
      published_at: new Date().toISOString()
    };

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .upsert(testPost, { onConflict: 'slug' })
      .select()
      .single();

    if (postError) {
      console.log('❌ Erro ao inserir post:', postError.message);
    } else {
      console.log('✅ Inserção de post funcionando!');
      console.log('📝 ID do post:', postData.id);
    }
  } catch (e) {
    console.log('❌ Erro ao inserir post:', e.message);
  }

  // Teste 4: Tentar inserir about
  console.log('\nℹ️ Testando inserção de about...');
  try {
    const testAbout = {
      title: 'Sobre - Verificação',
      paragraphs: ['Parágrafo de verificação do sistema.']
    };

    const { data: aboutData, error: aboutInsertError } = await supabase
      .from('about')
      .upsert(testAbout, { onConflict: 'id' })
      .select()
      .single();

    if (aboutInsertError) {
      console.log('❌ Erro ao inserir about:', aboutInsertError.message);
    } else {
      console.log('✅ Inserção de about funcionando!');
      console.log('📝 ID do about:', aboutData.id);
    }
  } catch (e) {
    console.log('❌ Erro ao inserir about:', e.message);
  }

  // Teste 5: Verificar APIs
  console.log('\n🌐 Testando APIs...');
  try {
    const baseUrl = 'https://alaniz-1wjvw1lysv-guima2048s-projects.vercel.app';
    
    // Teste API posts
    const postsRes = await fetch(`${baseUrl}/api/posts`);
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      console.log('✅ API /api/posts funcionando');
      console.log(`📊 Posts encontrados: ${postsData.length}`);
    } else {
      console.log('❌ API /api/posts falhou:', postsRes.status);
    }

    // Teste API about
    const aboutRes = await fetch(`${baseUrl}/api/about`);
    if (aboutRes.ok) {
      const aboutData = await aboutRes.json();
      console.log('✅ API /api/about funcionando');
      console.log(`📝 Título: ${aboutData.title}`);
    } else {
      console.log('❌ API /api/about falhou:', aboutRes.status);
    }

  } catch (e) {
    console.log('❌ Erro ao testar APIs:', e.message);
  }

  console.log('\n🎉 Verificação concluída!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
