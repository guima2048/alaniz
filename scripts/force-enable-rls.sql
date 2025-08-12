-- Forçar habilitação do RLS na tabela comments
-- Execute este SQL no Editor SQL do Supabase Dashboard

-- 1. Verificar status atual
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments' 
AND schemaname = 'public';

-- 2. Habilitar RLS (forçar)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3. Verificar se foi habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments' 
AND schemaname = 'public';

-- 4. Criar política básica de leitura
CREATE POLICY "Enable read access for all users" ON public.comments
FOR SELECT USING (true);

-- 5. Verificar políticas criadas
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'comments' 
AND schemaname = 'public';

-- 6. Teste final - verificar se RLS está ativo
SELECT 
    'RLS Status Check' as info,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'comments' 
            AND schemaname = 'public' 
            AND rowsecurity = true
        ) THEN 'RLS ENABLED' 
        ELSE 'RLS DISABLED' 
    END as status;
