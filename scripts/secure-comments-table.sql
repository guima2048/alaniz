-- Habilitar Row Level Security na tabela comments
-- Execute este SQL no Editor SQL do Supabase Dashboard

-- 1. Habilitar RLS na tabela
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas de segurança

-- Política para permitir leitura pública (qualquer pessoa pode ver comentários)
CREATE POLICY "Allow public read access" ON public.comments
FOR SELECT USING (true);

-- Política para permitir inserção apenas para usuários autenticados
CREATE POLICY "Allow authenticated insert" ON public.comments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Allow authenticated update" ON public.comments
FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Allow authenticated delete" ON public.comments
FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'comments' 
AND schemaname = 'public'
ORDER BY policyname;

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments' 
AND schemaname = 'public';
