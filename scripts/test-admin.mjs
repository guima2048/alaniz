import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔍 Testando funcionalidades do Admin...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Teste 1: Verificar tabela posts
  console.log('\n📝 Testando tabela posts...');
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('count')
    .limit(1);
  
  if (postsError) {
    console.log('❌ Erro na tabela posts:', postsError.message);
    console.log('💡 Criando tabela posts...');
    
    // Tentar criar a tabela posts
    const createPostsSQL = `
      CREATE TABLE IF NOT EXISTS public.posts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug text UNIQUE NOT NULL,
        title text NOT NULL,
        excerpt text,
        content text,
        cover text,
        published_at timestamptz
      );
      
      CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);
      
      ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "public can read posts" ON public.posts FOR SELECT USING (true);
      CREATE POLICY "public can insert posts" ON public.posts FOR INSERT WITH CHECK (true);
      CREATE POLICY "public can update posts" ON public.posts FOR UPDATE USING (true);
      CREATE POLICY "public can delete posts" ON public.posts FOR DELETE USING (true);
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPostsSQL });
    if (createError) {
      console.log('❌ Erro ao criar tabela posts:', createError.message);
    } else {
      console.log('✅ Tabela posts criada com sucesso!');
    }
  } else {
    console.log('✅ Tabela posts OK');
  }

  // Teste 2: Verificar tabela about
  console.log('\nℹ️ Testando tabela about...');
  const { data: about, error: aboutError } = await supabase
    .from('about')
    .select('count')
    .limit(1);
  
  if (aboutError) {
    console.log('❌ Erro na tabela about:', aboutError.message);
    console.log('💡 Criando tabela about...');
    
    // Tentar criar a tabela about
    const createAboutSQL = `
      CREATE TABLE IF NOT EXISTS public.about (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        paragraphs jsonb NOT NULL
      );
      
      ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "public can read about" ON public.about FOR SELECT USING (true);
      CREATE POLICY "public can insert about" ON public.about FOR INSERT WITH CHECK (true);
      CREATE POLICY "public can update about" ON public.about FOR UPDATE USING (true);
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createAboutSQL });
    if (createError) {
      console.log('❌ Erro ao criar tabela about:', createError.message);
    } else {
      console.log('✅ Tabela about criada com sucesso!');
    }
  } else {
    console.log('✅ Tabela about OK');
  }

  // Teste 3: Inserir post de teste
  console.log('\n✍️ Testando inserção de post...');
  const testPost = {
    slug: 'test-admin-post',
    title: 'Post de Teste do Admin',
    excerpt: 'Este é um teste das funcionalidades do admin',
    content: 'Conteúdo de teste para verificar se o sistema está funcionando.',
    published_at: new Date().toISOString()
  };

  const { data: insertData, error: insertError } = await supabase
    .from('posts')
    .upsert(testPost, { onConflict: 'slug' })
    .select()
    .single();

  if (insertError) {
    console.log('❌ Erro ao inserir post:', insertError.message);
  } else {
    console.log('✅ Inserção de post OK');
    console.log('📝 ID do post:', insertData.id);
  }

  // Teste 4: Testar about
  console.log('\nℹ️ Testando inserção de about...');
  const testAbout = {
    title: 'Sobre - Teste',
    paragraphs: ['Parágrafo de teste para verificar o funcionamento.']
  };

  const { data: aboutData, error: aboutInsertError } = await supabase
    .from('about')
    .upsert(testAbout, { onConflict: 'id' })
    .select()
    .single();

  if (aboutInsertError) {
    console.log('❌ Erro ao inserir about:', aboutInsertError.message);
  } else {
    console.log('✅ Inserção de about OK');
    console.log('📝 ID do about:', aboutData.id);
  }

  console.log('\n🎉 Teste do Admin concluído!');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
