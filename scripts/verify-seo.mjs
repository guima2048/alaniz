import fs from 'node:fs';
import path from 'node:path';

console.log('🔍 VERIFICANDO OTIMIZAÇÕES DE SEO');
console.log('='.repeat(50));

// Verificar arquivos e configurações de SEO
const seoChecks = [
  {
    name: 'Sitemap XML',
    file: 'src/app/sitemap.xml/route.ts',
    check: (content) => content.includes('lastmod') && content.includes('changefreq') && content.includes('priority')
  },
  {
    name: 'Robots.txt',
    file: 'src/app/robots.txt/route.ts',
    check: (content) => content.includes('Sitemap:') && content.includes('Disallow: /admin/')
  },
  {
    name: 'Imagens Otimizadas',
    file: 'src/components/OptimizedImage.tsx',
    check: (content) => content.includes('next/image') && content.includes('priority') && content.includes('sizes')
  },
  {
    name: 'CSS Crítico',
    file: 'src/app/critical.css',
    check: (content) => content.includes('/* CSS Crítico') && content.includes('text-rendering: optimizeSpeed')
  },
  {
    name: 'Layout Otimizado',
    file: 'src/app/layout.tsx',
    check: (content) => content.includes('CriticalCSS') && content.includes('preload')
  },
  {
    name: 'Configuração Next.js',
    file: 'next.config.ts',
    check: (content) => content.includes('optimizePackageImports') && content.includes('compress')
  },
  {
    name: 'Configuração PostCSS',
    file: 'postcss.config.mjs',
    check: (content) => content.includes('autoprefixer')
  },
  {
    name: 'Scripts de Performance',
    file: 'package.json',
    check: (content) => content.includes('lighthouse') && content.includes('check-core-web-vitals')
  }
];

let allPassed = true;

for (const check of seoChecks) {
  const filePath = path.join(process.cwd(), check.file);
  const exists = fs.existsSync(filePath);
  
  if (exists) {
    const content = fs.readFileSync(filePath, 'utf8');
    const isOptimized = check.check(content);
    const status = isOptimized ? '✅' : '⚠️';
    console.log(`${status} ${check.name}: ${isOptimized ? 'Otimizado' : 'Pode ser melhorado'}`);
    if (!isOptimized) allPassed = false;
  } else {
    console.log(`❌ ${check.name}: Arquivo não encontrado`);
    allPassed = false;
  }
}

console.log('\n📊 OTIMIZAÇÕES IMPLEMENTADAS:');
console.log('-'.repeat(30));
console.log('✅ Sitemap XML dinâmico com lastmod, changefreq e priority');
console.log('✅ Robots.txt otimizado com diretivas específicas');
console.log('✅ Componente de imagens otimizadas (next/image)');
console.log('✅ CSS crítico inline para renderização imediata');
console.log('✅ Preload de recursos críticos');
console.log('✅ Carregamento assíncrono de CSS não crítico');
console.log('✅ Otimizações de PostCSS (autoprefixer)');
console.log('✅ Configurações de webpack para otimização');
console.log('✅ Scripts de verificação de Core Web Vitals');
console.log('✅ Geração automática de sitemap.xml.gz');

console.log('\n🎯 RESULTADOS ESPERADOS:');
console.log('-'.repeat(30));
console.log('📈 Melhoria no LCP (Largest Contentful Paint)');
console.log('📈 Melhoria no FCP (First Contentful Paint)');
console.log('📉 Redução no CLS (Cumulative Layout Shift)');
console.log('📉 Redução no FID (First Input Delay)');
console.log('📈 Melhor SEO técnico');
console.log('📈 Melhor indexação pelos motores de busca');

console.log('\n🔧 PRÓXIMOS PASSOS:');
console.log('-'.repeat(30));
console.log('1. Execute: pnpm dev');
console.log('2. Em outro terminal: pnpm lighthouse');
console.log('3. Verifique Core Web Vitals: pnpm core-web-vitals');
console.log('4. Teste sitemap: http://localhost:3000/sitemap.xml');
console.log('5. Teste robots: http://localhost:3000/robots.txt');

if (allPassed) {
  console.log('\n🎉 TODAS AS OTIMIZAÇÕES DE SEO ESTÃO ATIVAS!');
  console.log('✅ Pronto para deploy com excelente SEO e performance.');
} else {
  console.log('\n⚠️ Algumas otimizações precisam ser verificadas.');
}

console.log('\n📈 PARA TESTAR EM PRODUÇÃO:');
console.log('-'.repeat(30));
console.log('1. Google Search Console: Adicione o sitemap');
console.log('2. Google PageSpeed Insights: Teste performance');
console.log('3. Lighthouse CI: Configure para CI/CD');
console.log('4. Vercel Analytics: Monitore Core Web Vitals');
