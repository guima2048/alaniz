import fs from 'node:fs';
import path from 'node:path';

// Ler dados existentes
const dataDir = path.join(process.cwd(), 'src', 'data');
const sitesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'sites.json'), 'utf8'));
const categoriesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'categories.json'), 'utf8'));

// SQL para criar tabelas
const createTablesSQL = `-- FASE 1: Criar tabelas sites e categories
-- Execute este SQL no Supabase SQL Editor

-- Remover tabelas se existirem
DROP TABLE IF EXISTS public.sites CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;

-- Criar tabela sites
CREATE TABLE public.sites (
  slug text PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  logo text,
  cover text,
  hero text,
  short_desc text,
  categories text[] DEFAULT '{}',
  price_min numeric(10,2),
  price_model text,
  style text,
  audience text,
  privacy_level text,
  editorial_score numeric(3,1),
  rating_avg numeric(3,1),
  rating_count integer,
  features text[] DEFAULT '{}'
);

-- Criar índices para performance
CREATE INDEX sites_categories_idx ON public.sites USING GIN (categories);
CREATE INDEX sites_price_min_idx ON public.sites (price_min);
CREATE INDEX sites_editorial_score_idx ON public.sites (editorial_score);

-- Habilitar RLS
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (leitura pública, escrita apenas via admin)
CREATE POLICY "public can read sites" ON public.sites FOR SELECT USING (true);
CREATE POLICY "admin can insert sites" ON public.sites FOR INSERT WITH CHECK (true);
CREATE POLICY "admin can update sites" ON public.sites FOR UPDATE USING (true);
CREATE POLICY "admin can delete sites" ON public.sites FOR DELETE USING (true);

-- Criar tabela categories
CREATE TABLE public.categories (
  slug text PRIMARY KEY,
  title text NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "public can read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "admin can insert categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "admin can update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "admin can delete categories" ON public.categories FOR DELETE USING (true);

-- Verificar se foi criado corretamente
SELECT 'Tabelas sites e categories criadas com sucesso!' as status;
`;

// SQL para inserir dados existentes
const insertDataSQL = `-- Inserir dados existentes

-- Inserir categorias
INSERT INTO public.categories (slug, title) VALUES
${categoriesData.map(cat => `  ('${cat.slug}', '${cat.title.replace(/'/g, "''")}')`).join(',\n')};

-- Inserir sites
INSERT INTO public.sites (
  slug, name, url, logo, cover, hero, short_desc, categories, 
  price_min, price_model, style, audience, privacy_level, 
  editorial_score, rating_avg, rating_count, features
) VALUES
${sitesData.map(site => `  (
    '${site.slug}',
    '${site.name.replace(/'/g, "''")}',
    '${site.url}',
    ${site.logo ? `'${site.logo}'` : 'NULL'},
    ${site.cover ? `'${site.cover}'` : 'NULL'},
    ${site.hero ? `'${site.hero}'` : 'NULL'},
    ${site.short_desc ? `'${site.short_desc.replace(/'/g, "''")}'` : 'NULL'},
    ARRAY[${(site.categories || []).map(cat => `'${cat}'`).join(', ')}],
    ${site.price_min || 'NULL'},
    ${site.price_model ? `'${site.price_model}'` : 'NULL'},
    ${site.style ? `'${site.style.replace(/'/g, "''")}'` : 'NULL'},
    ${site.audience ? `'${site.audience}'` : 'NULL'},
    ${site.privacy_level ? `'${site.privacy_level}'` : 'NULL'},
    ${site.editorial_score || 'NULL'},
    ${site.rating_avg || 'NULL'},
    ${site.rating_count || 'NULL'},
    ARRAY[${(site.features || []).map(f => `'${f.replace(/'/g, "''")}'`).join(', ')}]
  )`).join(',\n')};

-- Verificar dados inseridos
SELECT 'Dados migrados com sucesso!' as status;
SELECT COUNT(*) as total_sites FROM public.sites;
SELECT COUNT(*) as total_categories FROM public.categories;
`;

console.log('📋 SQL para FASE 1 - Sites e Categories');
console.log('='.repeat(60));
console.log('\n🔧 PASSO 1: Criar tabelas');
console.log('='.repeat(30));
console.log(createTablesSQL);
console.log('\n📊 PASSO 2: Migrar dados existentes');
console.log('='.repeat(30));
console.log(insertDataSQL);
console.log('='.repeat(60));
console.log('\n📝 INSTRUÇÕES:');
console.log('1. Execute o SQL do PASSO 1 primeiro');
console.log('2. Depois execute o SQL do PASSO 2');
console.log('3. Acesse: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq/sql');
console.log('\n🎯 Dados a migrar:');
console.log(`   - ${sitesData.length} sites`);
console.log(`   - ${categoriesData.length} categorias`);






