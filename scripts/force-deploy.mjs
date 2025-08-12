#!/usr/bin/env node

console.log('🚀 FORÇANDO NOVO DEPLOY NO VERCEL');
console.log('='.repeat(50));

// Verificar se estamos no diretório correto
import fs from 'node:fs';
import path from 'node:path';

const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.log('❌ ERRO: Execute este script dentro do diretório do projeto');
  process.exit(1);
}

console.log('✅ Diretório correto detectado');

// Criar arquivo de trigger para forçar deploy
const triggerFile = path.join(process.cwd(), '.vercel', 'deploy-trigger.txt');
const triggerDir = path.dirname(triggerFile);

try {
  if (!fs.existsSync(triggerDir)) {
    fs.mkdirSync(triggerDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString();
  fs.writeFileSync(triggerFile, `Deploy triggered at ${timestamp}\nGA4 and GTM variables should be applied`);
  
  console.log('✅ Arquivo de trigger criado');
} catch (error) {
  console.log('⚠️ Não foi possível criar arquivo de trigger:', error.message);
}

// Verificar configuração atual
console.log('\n📋 CONFIGURAÇÃO ATUAL:');
console.log('-'.repeat(30));

const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const hasGTM = envContent.includes('NEXT_PUBLIC_GTM_ID');
  const hasGA4 = envContent.includes('NEXT_PUBLIC_GA4_ID');
  
  console.log(`GTM ID local: ${hasGTM ? '✅' : '❌'}`);
  console.log(`GA4 ID local: ${hasGA4 ? '✅' : '❌'}`);
} else {
  console.log('❌ .env.local não encontrado');
}

console.log('\n🔧 PRÓXIMOS PASSOS AUTOMÁTICOS:');
console.log('-'.repeat(30));

// Commit e push automático
import { execSync } from 'child_process';

try {
  console.log('1. Adicionando arquivos...');
  execSync('git add .', { stdio: 'inherit' });
  
  console.log('2. Fazendo commit...');
  execSync('git commit -m "feat: forçar deploy com GA4 e GTM configurados"', { stdio: 'inherit' });
  
  console.log('3. Enviando para GitHub...');
  execSync('git push', { stdio: 'inherit' });
  
  console.log('\n✅ DEPLOY FORÇADO COM SUCESSO!');
  
} catch (error) {
  console.log('\n❌ ERRO no deploy automático:', error.message);
  console.log('\n🔧 FAÇA MANUALMENTE:');
  console.log('git add .');
  console.log('git commit -m "deploy"');
  console.log('git push');
}

console.log('\n📊 VERIFICAÇÕES PÓS-DEPLOY:');
console.log('-'.repeat(30));
console.log('1. Aguarde 2-3 minutos para o deploy');
console.log('2. Acesse o site em produção');
console.log('3. Abra DevTools (F12)');
console.log('4. No console, digite: gtag');
console.log('5. Deve aparecer uma função');
console.log('6. Digite: dataLayer');
console.log('7. Deve aparecer um array');

console.log('\n🔗 LINKS ÚTEIS:');
console.log('-'.repeat(30));
console.log('📊 Vercel Dashboard: https://vercel.com/dashboard');
console.log('📈 Google Analytics: https://analytics.google.com/');
console.log('🏷️ Google Tag Manager: https://tagmanager.google.com/');

console.log('\n⏰ TEMPO ESTIMADO:');
console.log('-'.repeat(30));
console.log('• Deploy: 2-3 minutos');
console.log('• GA4 aparecer: 24-48 horas');
console.log('• Dados completos: 1-2 dias');

console.log('\n🎉 TUDO PRONTO! Aguarde o deploy...');
