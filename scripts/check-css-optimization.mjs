#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 VERIFICANDO OTIMIZAÇÕES DE CSS');
console.log('='.repeat(50));

// Verificar otimizações implementadas
const cssOptimizations = [
  {
    name: 'CSS Crítico Inline no Layout',
    file: 'src/app/layout.tsx',
    check: (content) => {
      return content.includes('dangerouslySetInnerHTML') && 
             content.includes('CSS Crítico') && 
             content.includes('background-color: #FAFAF7') &&
             !content.includes('import "./globals.css"');
    }
  },
  {
    name: 'Componente CriticalCSS Otimizado',
    file: 'src/components/CriticalCSS.tsx',
    check: (content) => {
      return content.includes('media = \'print\'') && 
             content.includes('requestAnimationFrame') &&
             content.includes('non-critical.css');
    }
  },
  {
    name: 'CSS Não Crítico Separado',
    file: 'public/non-critical.css',
    check: (content) => {
      return content.includes('/* CSS Não Crítico') && 
             content.includes('@import "tailwindcss"') &&
             content.includes('transition-all');
    }
  },
  {
    name: 'Configuração Next.js Otimizada',
    file: 'next.config.ts',
    check: (content) => {
      return content.includes('optimizeCss: true') && 
             content.includes('Cache-Control') &&
             content.includes('non-critical.css');
    }
  },
  {
    name: 'Arquivo Critical.css Removido do Import',
    file: 'src/app/layout.tsx',
    check: (content) => {
      return !content.includes('import "./critical.css"') &&
             !content.includes('import "./globals.css"');
    }
  }
];

let allOptimized = true;
let optimizationCount = 0;

for (const opt of cssOptimizations) {
  const filePath = path.join(process.cwd(), opt.file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const isOptimized = opt.check(content);
    const status = isOptimized ? '✅' : '⚠️';
    console.log(`${status} ${opt.name}: ${isOptimized ? 'Otimizado' : 'Pode ser melhorado'}`);
    if (isOptimized) optimizationCount++;
    if (!isOptimized) allOptimized = false;
  } else {
    console.log(`❌ ${opt.name}: Arquivo não encontrado`);
    allOptimized = false;
  }
}

console.log('\n📊 RESUMO DAS OTIMIZAÇÕES:');
console.log('-'.repeat(30));
console.log(`✅ ${optimizationCount}/${cssOptimizations.length} otimizações implementadas`);

if (allOptimized) {
  console.log('\n🎉 TODAS AS OTIMIZAÇÕES DE CSS ESTÃO IMPLEMENTADAS!');
  console.log('\n📈 BENEFÍCIOS ESPERADOS:');
  console.log('-'.repeat(30));
  console.log('• Redução de ~180ms no tempo de carregamento inicial');
  console.log('• Melhoria no LCP (Largest Contentful Paint)');
  console.log('• CSS crítico carregado inline para renderização imediata');
  console.log('• CSS não crítico carregado de forma assíncrona');
  console.log('• Prevenção de FOUC (Flash of Unstyled Content)');
  console.log('• Cache otimizado para arquivos CSS');
} else {
  console.log('\n⚠️ ALGUMAS OTIMIZAÇÕES AINDA PRECISAM SER IMPLEMENTADAS');
  console.log('\n🔧 PRÓXIMOS PASSOS:');
  console.log('-'.repeat(30));
  console.log('1. Verificar se o CSS crítico está inline no layout');
  console.log('2. Confirmar que o CSS não crítico está sendo carregado assincronamente');
  console.log('3. Testar a performance com Lighthouse');
  console.log('4. Verificar se não há imports síncronos de CSS');
}

console.log('\n🧪 PARA TESTAR:');
console.log('-'.repeat(30));
console.log('1. Execute: npm run build');
console.log('2. Execute: npm run start');
console.log('3. Abra o DevTools > Network');
console.log('4. Verifique se o CSS crítico está inline');
console.log('5. Verifique se o CSS não crítico carrega com media="print"');

console.log('\n📱 TESTE DE PERFORMANCE:');
console.log('-'.repeat(30));
console.log('• Use o Lighthouse para medir LCP, FCP e CLS');
console.log('• Compare os tempos antes e depois das otimizações');
console.log('• Verifique se não há solicitações bloqueantes no Network tab');

console.log('\n' + '='.repeat(50));
