#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

console.log('🔧 CONFIGURANDO GOOGLE ANALYTICS 4');
console.log('='.repeat(50));

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ijzceqcwzrylhgmixaqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA

# Base URL for development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Google Analytics 4 and Google Tag Manager
NEXT_PUBLIC_GTM_ID=GTM-5X3M5L9R
NEXT_PUBLIC_GA4_ID=G-EB82DX7V11

# Generated automatically - do not edit manually
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local criado com sucesso!');
  console.log('📁 Arquivo salvo em:', envPath);
  
  console.log('\n📋 CONFIGURAÇÃO:');
  console.log('-'.repeat(30));
  console.log('✅ NEXT_PUBLIC_GTM_ID=GTM-5X3M5L9R');
  console.log('✅ NEXT_PUBLIC_GA4_ID=G-EB82DX7V11');
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('-'.repeat(30));
  console.log('1. Execute: pnpm dev');
  console.log('2. Abra: http://localhost:3000');
  console.log('3. Verifique o painel de debug no canto inferior direito');
  console.log('4. Abra DevTools (F12) e digite: gtag');
  
} catch (error) {
  console.error('❌ Erro ao criar .env.local:', error.message);
  process.exit(1);
}
