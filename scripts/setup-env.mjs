import fs from 'node:fs';
import path from 'node:path';

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ijzceqcwzrylhgmixaqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA

# Base URL for development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Generated automatically - do not edit manually
`;

const envPath = path.join(process.cwd(), '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local criado com sucesso!');
  console.log('📁 Arquivo salvo em:', envPath);
  console.log('\n🚀 Agora você pode rodar: pnpm dev');
} catch (error) {
  console.error('❌ Erro ao criar .env.local:', error.message);
  process.exit(1);
}
