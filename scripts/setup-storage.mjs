console.log('📦 Configurando Supabase Storage para FASE 2...');
console.log('='.repeat(60));

console.log('\n🔧 PASSO 1: Criar bucket no Supabase');
console.log('='.repeat(30));
console.log(`
1. Acesse: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq/storage
2. Clique em "New bucket"
3. Nome: "media"
4. Public bucket: ✅ (marcado)
5. File size limit: 50MB
6. Allowed MIME types: image/*
7. Clique em "Create bucket"
`);

console.log('\n🔧 PASSO 2: Configurar políticas de acesso');
console.log('='.repeat(30));
console.log(`
Execute este SQL no Supabase SQL Editor:

-- Políticas para bucket "media"
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, ARRAY['image/*'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Política para leitura pública
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'media');

-- Política para upload (qualquer um pode fazer upload)
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media');

-- Política para deletar (qualquer um pode deletar)
CREATE POLICY "Public Delete" ON storage.objects
FOR DELETE USING (bucket_id = 'media');
`);

console.log('\n📁 Estrutura de pastas no bucket:');
console.log('='.repeat(30));
console.log(`
/media
├── logos/     (logos dos sites)
├── covers/    (capas dos sites/posts)
└── heroes/    (imagens hero dos sites)
`);

console.log('\n🎯 O que será migrado:');
console.log('='.repeat(30));
console.log(`
- /api/media/logos     → Supabase Storage /media/logos
- /api/media/covers    → Supabase Storage /media/covers  
- /api/media/heroes    → Supabase Storage /media/heroes
`);

console.log('\n📝 Próximos passos:');
console.log('='.repeat(30));
console.log(`
1. Criar o bucket "media" no Supabase
2. Executar as políticas SQL
3. Atualizar as rotas de API para usar Storage
4. Migrar imagens existentes (opcional)
5. Testar uploads
`);

console.log('\n🚀 Benefícios:');
console.log('='.repeat(30));
console.log(`
✅ Imagens persistem na Vercel
✅ URLs públicas automáticas
✅ CDN global (rápido)
✅ Gratuito até 1GB
✅ Backup automático
`);


