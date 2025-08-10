import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔧 Criando tabelas do Admin no Supabase...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // Verificar se as tabelas já existem
  console.log('\n📋 Verificando tabelas existentes...');
  
  const { data: existingTables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['posts', 'about']);

  if (tablesError) {
    console.log('❌ Erro ao verificar tabelas:', tablesError.message);
  } else {
    console.log('✅ Tabelas encontradas:', existingTables?.map(t => t.table_name) || []);
  }

  // Tentar criar tabela posts diretamente
  console.log('\n📝 Tentando criar tabela posts...');
  try {
    const { error: createPostsError } = await supabase
      .rpc('create_posts_table');
    
    if (createPostsError) {
      console.log('❌ Erro ao criar tabela posts via RPC:', createPostsError.message);
      console.log('💡 Tentando método alternativo...');
      
      // Tentar inserir um post para ver se a tabela existe
      const testPost = {
        slug: 'test-post',
        title: 'Post de Teste',
        excerpt: 'Teste',
        content: 'Conteúdo de teste',
        published_at: new Date().toISOString()
      };

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert(testPost)
        .select()
        .single();

      if (postError) {
        console.log('❌ Tabela posts não existe:', postError.message);
        console.log('🔧 Você precisa criar a tabela posts manualmente no Supabase Dashboard');
      } else {
        console.log('✅ Tabela posts existe e está funcionando!');
        console.log('📝 Post criado:', postData.id);
      }
    } else {
      console.log('✅ Tabela posts criada com sucesso!');
    }
  } catch (e) {
    console.log('❌ Erro ao tentar criar posts:', e.message);
  }

  // Tentar criar tabela about diretamente
  console.log('\nℹ️ Tentando criar tabela about...');
  try {
    const { error: createAboutError } = await supabase
      .rpc('create_about_table');
    
    if (createAboutError) {
      console.log('❌ Erro ao criar tabela about via RPC:', createAboutError.message);
      console.log('💡 Tentando método alternativo...');
      
      // Tentar inserir um about para ver se a tabela existe
      const testAbout = {
        title: 'Sobre - Teste',
        paragraphs: ['Parágrafo de teste']
      };

      const { data: aboutData, error: aboutError } = await supabase
        .from('about')
        .insert(testAbout)
        .select()
        .single();

      if (aboutError) {
        console.log('❌ Tabela about não existe:', aboutError.message);
        console.log('🔧 Você precisa criar a tabela about manualmente no Supabase Dashboard');
      } else {
        console.log('✅ Tabela about existe e está funcionando!');
        console.log('📝 About criado:', aboutData.id);
      }
    } else {
      console.log('✅ Tabela about criada com sucesso!');
    }
  } catch (e) {
    console.log('❌ Erro ao tentar criar about:', e.message);
  }

  console.log('\n📋 INSTRUÇÕES MANUAIS:');
  console.log('='.repeat(50));
  console.log('1. Acesse: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq');
  console.log('2. Vá em "SQL Editor"');
  console.log('3. Execute os comandos SQL abaixo:');
  console.log('\n📝 Para criar tabela posts:');
  console.log(`
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
  `);

  console.log('\nℹ️ Para criar tabela about:');
  console.log(`
CREATE TABLE IF NOT EXISTS public.about (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  paragraphs jsonb NOT NULL
);

ALTER TABLE public.about ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public can read about" ON public.about FOR SELECT USING (true);
CREATE POLICY "public can insert about" ON public.about FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update about" ON public.about FOR UPDATE USING (true);
  `);

  console.log('\n🎉 Após criar as tabelas, execute: node scripts/test-admin.mjs');

} catch (error) {
  console.error('❌ Erro geral:', error.message);
}
