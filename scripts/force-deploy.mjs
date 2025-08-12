#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Forçando novo deploy no Vercel...\n');

try {
  // Verificar se o Vercel CLI está instalado
  try {
    execSync('vercel --version', { stdio: 'pipe' });
  } catch {
    console.log('📦 Instalando Vercel CLI...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  // Verificar se está logado
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
  } catch {
    console.log('🔐 Fazendo login no Vercel...');
    execSync('vercel login', { stdio: 'inherit' });
  }

  // Fazer deploy
  console.log('🚀 Iniciando deploy...');
  execSync('vercel --prod', { stdio: 'inherit' });

  console.log('\n✅ Deploy concluído!');
  console.log('🌐 Verifique o site em alguns minutos...');

} catch (error) {
  console.error('❌ Erro no deploy:', error.message);
  console.log('\n💡 Alternativas:');
  console.log('1. Faça push para o GitHub e o Vercel fará deploy automático');
  console.log('2. Use o dashboard do Vercel para fazer deploy manual');
  console.log('3. Verifique os logs no dashboard do Vercel');
}
