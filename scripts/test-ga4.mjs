#!/usr/bin/env node

console.log('🔍 TESTANDO GOOGLE ANALYTICS 4');
console.log('='.repeat(50));

// Verificar variáveis de ambiente
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

console.log('\n📋 CONFIGURAÇÃO:');
console.log('-'.repeat(30));
console.log(`GTM ID: ${GTM_ID ? '✅' : '❌'} ${GTM_ID || 'Não configurado'}`);
console.log(`GA4 ID: ${GA4_ID ? '✅' : '❌'} ${GA4_ID || 'Não configurado'}`);

if (!GTM_ID || !GA4_ID) {
  console.log('\n❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('\n🔧 SOLUÇÃO:');
  console.log('1. Configure no Vercel:');
  console.log('   NEXT_PUBLIC_GTM_ID=GTM-5X3M5L9R');
  console.log('   NEXT_PUBLIC_GA4_ID=G-EB82DX7V11');
  console.log('2. Faça um novo deploy');
  process.exit(1);
}

console.log('\n✅ Variáveis de ambiente configuradas!');

// Verificar se o site está acessível
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

console.log('\n🌐 TESTANDO ACESSO AO SITE:');
console.log('-'.repeat(30));
console.log(`URL: ${BASE_URL}`);

// Teste simples de conectividade
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
  const https = require('https');
  const http = require('http');
  
  const url = new URL(BASE_URL);
  const client = url.protocol === 'https:' ? https : http;
  
  const req = client.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Site acessível!');
    } else {
      console.log('⚠️ Site retornou status diferente de 200');
    }
  });
  
  req.on('error', (err) => {
    console.log('❌ Erro ao acessar site:', err.message);
  });
  
  req.setTimeout(5000, () => {
    console.log('⏰ Timeout ao acessar site');
  });
  
} catch (error) {
  console.log('❌ Erro no teste de conectividade:', error.message);
}

console.log('\n🔍 VERIFICAÇÕES MANUAIS:');
console.log('-'.repeat(30));
console.log('1. Abra o site no navegador');
console.log('2. Pressione F12 (DevTools)');
console.log('3. Vá na aba Console');
console.log('4. Digite: gtag');
console.log('   - Deve aparecer uma função');
console.log('5. Digite: dataLayer');
console.log('   - Deve aparecer um array');
console.log('6. Vá na aba Network');
console.log('   - Procure por requests para googletagmanager.com');
console.log('   - Procure por requests para google-analytics.com');

console.log('\n📊 VERIFICAR NO GOOGLE ANALYTICS:');
console.log('-'.repeat(30));
console.log('1. Acesse: https://analytics.google.com/');
console.log('2. Vá em "Relatórios em tempo real"');
console.log('3. Acesse o site em outra aba');
console.log('4. Verifique se aparece atividade');

console.log('\n🔧 SOLUÇÕES COMUNS:');
console.log('-'.repeat(30));
console.log('❌ Se gtag não existe:');
console.log('   - Verifique se as variáveis estão no Vercel');
console.log('   - Faça um novo deploy');
console.log('   - Aguarde alguns minutos');

console.log('❌ Se dataLayer está vazio:');
console.log('   - Verifique se o GTM está carregando');
console.log('   - Teste em modo incógnito');

console.log('❌ Se não aparece no GA4:');
console.log('   - Aguarde 24-48 horas');
console.log('   - Verifique se o ID está correto');
console.log('   - Teste em "Relatórios em tempo real"');

console.log('\n🎯 PRÓXIMOS PASSOS:');
console.log('-'.repeat(30));
console.log('1. Teste o site localmente: pnpm dev');
console.log('2. Verifique o console do navegador');
console.log('3. Teste no Google Analytics');
console.log('4. Aguarde dados aparecerem (24-48h)');

console.log('\n✅ Teste concluído!');
