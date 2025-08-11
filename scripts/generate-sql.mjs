const sql = `-- Recriar tabelas com estrutura correta
-- Execute este SQL no Supabase SQL Editor

-- Remover tabelas existentes
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;

-- Criar tabela comments
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  message text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

-- Criar índice para performance
CREATE INDEX comments_slug_idx ON public.comments(slug);

-- Habilitar RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "public can read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "public can insert comments" ON public.comments FOR INSERT WITH CHECK (true);

-- Criar tabela ratings
CREATE TABLE public.ratings (
  slug text PRIMARY KEY,
  score float NOT NULL,
  count int NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "public can read ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "public can upsert ratings" ON public.ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "public can update ratings" ON public.ratings FOR UPDATE USING (true);

-- Verificar se foi criado corretamente
SELECT 'Tabelas criadas com sucesso!' as status;
`;

console.log('📋 SQL para recriar as tabelas:');
console.log('='.repeat(50));
console.log(sql);
console.log('='.repeat(50));
console.log('\n📝 Copie este SQL e execute no Supabase SQL Editor');
console.log('🔗 Acesse: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq/sql');


