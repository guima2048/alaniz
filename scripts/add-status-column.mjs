import { createClient } from '@supabase/supabase-js';

const url = 'https://ijzceqcwzrylhgmixaqq.supabase.co';
const anon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqemNlcWN3enJ5bGhnbWl4YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4NTc3NzEsImV4cCI6MjA3MDQzMzc3MX0.RRatZdAClrlAdoZt-s3fxWs8IOIksvOobUmvwlNZHvA';

console.log('🔄 Adicionando coluna status à tabela de comentários...');

try {
  const supabase = createClient(url, anon, {
    auth: { persistSession: false },
  });

  // SQL para adicionar coluna status
  const sql = `
    ALTER TABLE public.comments 
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
    
    UPDATE public.comments 
    SET status = 'approved' 
    WHERE status IS NULL OR status = '';
  `;

  console.log('\n📝 Executando SQL...');
  console.log('SQL:', sql);
  
  console.log('\n⚠️ IMPORTANTE: Execute o seguinte SQL no Supabase SQL Editor:');
  console.log('='.repeat(60));
  console.log(sql);
  console.log('='.repeat(60));
  
  console.log('\n📋 Passos:');
  console.log('1. Acesse: https://supabase.com/dashboard/project/ijzceqcwzrylhgmixaqq/sql');
  console.log('2. Cole o SQL acima');
  console.log('3. Clique em "Run"');
  console.log('4. Depois execute: node scripts/update-comments-table.mjs');

} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
