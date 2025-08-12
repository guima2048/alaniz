#!/usr/bin/env node

console.log('🔍 Verificando variáveis de ambiente para Vercel...\n');

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_BASE_URL'
];

console.log('📋 Variáveis obrigatórias:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') ? value.substring(0, 20) + '...' : value}`);
  } else {
    console.log(`❌ ${varName}: NÃO DEFINIDA`);
  }
});

console.log('\n📊 Outras variáveis relevantes:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
console.log(`VERCEL: ${process.env.VERCEL || 'não definido'}`);
console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV || 'não definido'}`);

console.log('\n📝 Instruções para Vercel:');
console.log('1. Vá para o dashboard do Vercel');
console.log('2. Selecione seu projeto');
console.log('3. Vá para Settings > Environment Variables');
console.log('4. Adicione as seguintes variáveis:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://ijzceqcwzrylhgmixaqq.supabase.co');
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA');
console.log('   - NEXT_PUBLIC_BASE_URL=https://alaniz.vercel.app');
console.log('5. Clique em "Save"');
console.log('6. Faça um novo deploy');
