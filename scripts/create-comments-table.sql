-- Criar tabela comments no Supabase
-- Execute este SQL no Editor SQL do Supabase Dashboard

CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_comments_slug ON public.comments(slug);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);

-- Habilitar Row Level Security (RLS) se necessário
-- ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (descomente se necessário)
-- CREATE POLICY "Allow public read access" ON public.comments FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated insert" ON public.comments FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Allow authenticated update" ON public.comments FOR UPDATE USING (true);
-- CREATE POLICY "Allow authenticated delete" ON public.comments FOR DELETE USING (true);

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'comments' 
AND table_schema = 'public'
ORDER BY ordinal_position;
