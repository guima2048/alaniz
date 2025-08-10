import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔧 Configurando tabelas do Admin no Supabase...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Criar tabela posts
  console.log('\n📝 Criando tabela posts...');
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
    
    DROP POLICY IF EXISTS "public can read posts" ON public.posts;
    DROP POLICY IF EXISTS "public can insert posts" ON public.posts;
    DROP POLICY IF EXISTS "public can update posts" ON public.posts;
    DROP POLICY IF EXISTS "public can delete posts" ON public.posts;
    
    CREATE POLICY "public can read posts" ON public.posts FOR SELECT USING (true);
    CREATE POLICY "public can insert posts" ON public.posts FOR INSERT WITH CHECK (true);
    CREATE POLICY "public can update posts" ON public.posts FOR UPDATE USING (true);
    CREATE POLICY "public can delete posts" ON public.posts FOR DELETE USING (true);
  `;
  
  const { error: postsError } = await supabase.rpc('exec_sql', { sql: createPostsSQL });
  if (postsError) {
    console.log('❌ Erro ao criar tabela posts:', postsError.message);
  } else {
    console.log('✅ Tabela posts criada com sucesso!');
  }

  // Criar tabela about
  console.log('\nℹ️ Criando tabela about...');
  const createAboutSQL = `
    CREATE TABLE IF NOT EXISTS public.about (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      paragraphs jsonb NOT NULL
    );
    
    ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "public can read about" ON public.about;
    DROP POLICY IF EXISTS "public can insert about" ON public.about;
    DROP POLICY IF EXISTS "public can update about" ON public.about;
    
    CREATE POLICY "public can read about" ON public.about FOR SELECT USING (true);
    CREATE POLICY "public can insert about" ON public.about FOR INSERT WITH CHECK (true);
    CREATE POLICY "public can update about" ON public.about FOR UPDATE USING (true);
  `;
  
  const { error: aboutError } = await supabase.rpc('exec_sql', { sql: createAboutSQL });
  if (aboutError) {
    console.log('❌ Erro ao criar tabela about:', aboutError.message);
  } else {
    console.log('✅ Tabela about criada com sucesso!');
  }

  // Inserir dados iniciais
  console.log('\n📝 Inserindo dados iniciais...');
  
  // Post inicial
  const initialPost = {
    slug: 'bem-vindo',
    title: 'Bem-vindo ao Alaniz',
    excerpt: 'Seu guia para sites de relacionamento',
    content: 'Este é o primeiro post do blog. Aqui você encontrará análises e dicas sobre sites de relacionamento.',
    published_at: new Date().toISOString()
  };

  const { error: postInsertError } = await supabase
    .from('posts')
    .upsert(initialPost, { onConflict: 'slug' });

  if (postInsertError) {
    console.log('❌ Erro ao inserir post inicial:', postInsertError.message);
  } else {
    console.log('✅ Post inicial inserido!');
  }

  // About inicial
  const initialAbout = {
    title: 'Sobre o Alaniz',
    paragraphs: [
      'Somos um projeto editorial focado em análises neutras de plataformas de relacionamento.',
      'Nossa missão é ajudar você a encontrar a plataforma ideal para suas necessidades.'
    ]
  };

  const { error: aboutInsertError } = await supabase
    .from('about')
    .upsert(initialAbout, { onConflict: 'id' });

  if (aboutInsertError) {
    console.log('❌ Erro ao inserir about inicial:', aboutInsertError.message);
  } else {
    console.log('✅ About inicial inserido!');
  }

  console.log('\n🎉 Configuração do Admin concluída!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Teste o admin em: https://seu-site.vercel.app/admin');
  console.log('2. Tente criar, editar e deletar posts');
  console.log('3. Edite a página sobre');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
