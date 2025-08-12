-- Remover status "Unrestricted" da tabela comments
-- Execute este SQL no Editor SQL do Supabase Dashboard

-- 1. Habilitar Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 2. Criar política que permite apenas leitura pública
-- (qualquer pessoa pode ver comentários, mas não pode inserir/editar/deletar)
CREATE POLICY "Allow read only" ON public.comments
FOR SELECT USING (true);

-- 3. Verificar se RLS foi habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments' 
AND schemaname = 'public';

-- 4. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'comments' 
AND schemaname = 'public';
