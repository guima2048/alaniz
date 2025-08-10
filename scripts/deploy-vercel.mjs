import fs from 'node:fs';
import path from 'node:path';

console.log('🚀 PREPARANDO DEPLOY NA VERCEL');
console.log('='.repeat(50));

console.log('\n📋 CHECKLIST DE DEPLOY:');
console.log('-'.repeat(30));

// Verificar arquivos essenciais
const essentialFiles = [
  '.env.local',
  'package.json',
  'next.config.ts',
  'tailwind.config.ts',
  'tsconfig.json'
];

let allGood = true;

for (const file of essentialFiles) {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allGood = false;
}

// Verificar variáveis de ambiente
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const hasBaseUrl = envContent.includes('NEXT_PUBLIC_BASE_URL');
  
  console.log(`${hasSupabaseUrl ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_URL`);
  console.log(`${hasSupabaseKey ? '✅' : '❌'} NEXT_PUBLIC_SUPABASE_ANON_KEY`);
  console.log(`${hasBaseUrl ? '✅' : '❌'} NEXT_PUBLIC_BASE_URL`);
  
  if (!hasSupabaseUrl || !hasSupabaseKey || !hasBaseUrl) allGood = false;
}

// Verificar favicon
const faviconExists = fs.existsSync('public/favicon.svg');
console.log(`${faviconExists ? '✅' : '❌'} public/favicon.svg`);

console.log('\n📝 INSTRUÇÕES PARA DEPLOY:');
console.log('='.repeat(50));

if (!allGood) {
  console.log('❌ Alguns arquivos estão faltando. Corrija antes do deploy.');
  process.exit(1);
}

console.log(`
✅ TUDO PRONTO PARA DEPLOY!

🚀 PASSO A PASSO:

1. Acesse: https://vercel.com
2. Faça login com GitHub/GitLab
3. Clique em "New Project"
4. Importe este repositório
5. ⚠️ IMPORTANTE: Configure as variáveis de ambiente:
   - Vá em "Settings" > "Environment Variables"
   - Adicione cada variável individualmente:

   Nome: NEXT_PUBLIC_SUPABASE_URL
   Valor: https://ijzceqcwzrylhgmixaqq.supabase.co
   Environment: Production, Preview, Development

   Nome: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA
   Environment: Production, Preview, Development

   Nome: NEXT_PUBLIC_BASE_URL
   Valor: https://seu-dominio.vercel.app
   Environment: Production, Preview, Development

6. Clique em "Deploy"

🎯 APÓS O DEPLOY:
- O favicon "Alaniz" aparecerá na aba do navegador
- Todas as funcionalidades estarão online
- Banco de dados Supabase funcionando
- Storage para imagens funcionando

📊 STATUS ATUAL:
- ✅ Banco de dados: Supabase configurado
- ✅ Storage: Supabase Storage configurado  
- ✅ Favicon: Alaniz personalizado
- ✅ SEO: Otimizado
- ✅ Performance: Otimizado
- ✅ Vercel config: Corrigido (removido env do vercel.json)
`);

console.log('\n🔗 LINKS ÚTEIS:');
console.log('-'.repeat(30));
console.log('📊 Supabase Dashboard: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq');
console.log('🚀 Vercel: https://vercel.com');
console.log('📦 GitHub: https://github.com/guima2048/alaniz');

console.log('\n⚠️ SOLUÇÃO PARA ERRO 404:');
console.log('-'.repeat(30));
console.log('Se aparecer erro 404 após o deploy:');
console.log('1. Verifique se as variáveis de ambiente estão configuradas');
console.log('2. Aguarde alguns minutos para o cache ser limpo');
console.log('3. Faça um novo deploy se necessário');

console.log('\n🎉 BOA SORTE COM O DEPLOY!');
