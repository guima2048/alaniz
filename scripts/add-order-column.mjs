console.log('🔧 Adicionando coluna "order" à tabela categories...');

const sql = `
  ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS "order" integer;
  
  -- Atualizar categorias existentes com ordem baseada na posição atual
  UPDATE public.categories
  SET "order" = CASE 
    WHEN slug = 'todos' THEN 1
    WHEN slug = 'sugar' THEN 2
    WHEN slug = 'estilo-tinder' THEN 3
    WHEN slug = 'cristao' THEN 4
    WHEN slug = 'nicho' THEN 5
    ELSE 999
  END
  WHERE "order" IS NULL;
`;

console.log('\n📋 Execute o seguinte SQL no Supabase SQL Editor:');
console.log('='.repeat(60));
console.log(sql);
console.log('='.repeat(60));

console.log('\n📝 Instruções:');
console.log('1. Acesse o Supabase Dashboard');
console.log('2. Vá para SQL Editor');
console.log('3. Cole o SQL acima');
console.log('4. Clique em "Run"');
console.log('5. Verifique se a coluna foi criada na tabela categories');

console.log('\n✅ Após executar o SQL, o sistema de ordenação funcionará completamente!');
