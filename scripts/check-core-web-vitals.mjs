import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

console.log('📊 VERIFICANDO CORE WEB VITALS');
console.log('='.repeat(50));

// Thresholds mínimos para Core Web Vitals
const THRESHOLDS = {
  LCP: 2500, // 2.5 segundos
  FID: 100,  // 100ms
  CLS: 0.1,  // 0.1
  FCP: 1800, // 1.8 segundos
  TTI: 3800  // 3.8 segundos
};

function checkLighthouseReport() {
  const reportPath = path.join(process.cwd(), 'lighthouse-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.log('⚠️ Relatório Lighthouse não encontrado.');
    console.log('Execute: pnpm lighthouse');
    return false;
  }

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const audits = report.audits;
    
    console.log('\n📈 RESULTADOS CORE WEB VITALS:');
    console.log('-'.repeat(30));
    
    const metrics = {
      LCP: audits['largest-contentful-paint']?.numericValue,
      FID: audits['max-potential-fid']?.numericValue,
      CLS: audits['cumulative-layout-shift']?.numericValue,
      FCP: audits['first-contentful-paint']?.numericValue,
      TTI: audits['interactive']?.numericValue
    };

    let allPassed = true;
    
    for (const [metric, value] of Object.entries(metrics)) {
      if (value === undefined) {
        console.log(`❌ ${metric}: Não disponível`);
        allPassed = false;
        continue;
      }

      const threshold = THRESHOLDS[metric];
      const passed = value <= threshold;
      const status = passed ? '✅' : '❌';
      const color = passed ? 'verde' : 'vermelho';
      
      console.log(`${status} ${metric}: ${value.toFixed(0)}ms (limite: ${threshold}ms) - ${color}`);
      
      if (!passed) {
        allPassed = false;
      }
    }

    // Verificar score geral
    const performanceScore = report.categories?.performance?.score * 100;
    console.log(`\n📊 Performance Score: ${performanceScore?.toFixed(0)}/100`);
    
    if (performanceScore < 90) {
      console.log('⚠️ Performance score abaixo de 90. Otimizações recomendadas.');
      allPassed = false;
    }

    return allPassed;
    
  } catch (error) {
    console.error('❌ Erro ao ler relatório Lighthouse:', error.message);
    return false;
  }
}

function suggestOptimizations() {
  console.log('\n🔧 SUGESTÕES DE OTIMIZAÇÃO:');
  console.log('-'.repeat(30));
  console.log('📸 LCP (Largest Contentful Paint):');
  console.log('  - Use next/image para otimização automática');
  console.log('  - Adicione priority={true} em imagens hero');
  console.log('  - Implemente lazy loading para imagens abaixo da dobra');
  console.log('  - Use formatos modernos (WebP, AVIF)');
  
  console.log('\n⚡ FID (First Input Delay):');
  console.log('  - Reduza JavaScript não essencial');
  console.log('  - Use dynamic imports para code splitting');
  console.log('  - Carregue scripts com defer/async');
  console.log('  - Otimize bundle size');
  
  console.log('\n📐 CLS (Cumulative Layout Shift):');
  console.log('  - Defina width e height em todas as imagens');
  console.log('  - Reserve espaço para elementos dinâmicos');
  console.log('  - Evite inserção de conteúdo acima do conteúdo existente');
  console.log('  - Use aspect-ratio CSS quando possível');
}

// Verificar se o servidor está rodando
function checkServerRunning() {
  try {
    const response = execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3000', { encoding: 'utf8' });
    return response.trim() === '200';
  } catch {
    return false;
  }
}

async function main() {
  if (!checkServerRunning()) {
    console.log('⚠️ Servidor não está rodando em localhost:3000');
    console.log('Execute: pnpm dev');
    console.log('Em outro terminal: pnpm lighthouse');
    return;
  }

  const passed = checkLighthouseReport();
  
  if (!passed) {
    suggestOptimizations();
    console.log('\n❌ Core Web Vitals não atingiram os thresholds mínimos!');
    console.log('Otimize antes de fazer deploy.');
    process.exit(1);
  } else {
    console.log('\n🎉 TODOS OS CORE WEB VITALS ESTÃO NO VERDE!');
    console.log('✅ Pronto para deploy com excelente performance.');
  }
}

main().catch(console.error);
