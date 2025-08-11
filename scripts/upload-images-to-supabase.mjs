#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function ensureEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Variáveis NEXT_PUBLIC_SUPABASE_URL/ANON_KEY ausentes');
  }
  return createClient(url, anon, { auth: { persistSession: false } });
}

function guessContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

async function uploadDir(supabase, localDir, remotePrefix) {
  const root = process.cwd();
  const dir = path.join(root, 'public', localDir);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.'));
  const uploaded = [];
  for (const f of files) {
    const filePath = path.join(dir, f);
    const key = `${remotePrefix}/${f}`;
    const buffer = fs.readFileSync(filePath);
    const contentType = guessContentType(f);
    const { data: head } = await supabase.storage.from('media').list(remotePrefix, { search: f });
    const exists = (head || []).some((it) => it.name === f);
    if (!exists) {
      const { error: upErr } = await supabase.storage.from('media').upload(key, buffer, { contentType, upsert: true });
      if (upErr) {
        console.error('Falha upload', key, upErr.message);
        continue;
      }
    }
    const { data: urlData } = supabase.storage.from('media').getPublicUrl(key);
    uploaded.push({ local: `/${localDir}/${f}`, remote: urlData.publicUrl, key });
    console.log('✔ Disponível:', key);
  }
  return uploaded;
}

function mapBySlug(uploaded, subdir) {
  // uploaded items have local like /logos/slug.svg, extract slug
  const bySlug = new Map();
  for (const it of uploaded) {
    const base = path.basename(it.local);
    const slug = base.replace(/\.(svg|png|jpg|jpeg)$/i, '');
    const cur = bySlug.get(slug) || {};
    cur[subdir] = it.remote;
    bySlug.set(slug, cur);
  }
  return bySlug;
}

async function main() {
  const supabase = ensureEnv();
  console.log('Subindo imagens para bucket media...');
  const logos = await uploadDir(supabase, 'logos', 'logos');
  const covers = await uploadDir(supabase, 'covers', 'covers');
  const heroes = await uploadDir(supabase, 'heroes', 'heroes');

  // Atualiza registros dos sites com URLs públicas
  const mapLogos = mapBySlug(logos, 'logo');
  const mapCovers = mapBySlug(covers, 'cover');
  const mapHeroes = mapBySlug(heroes, 'hero');

  const updates = new Map();
  for (const [slug, v] of mapLogos) updates.set(slug, { slug, ...v });
  for (const [slug, v] of mapCovers) updates.set(slug, { ...(updates.get(slug) || { slug }), ...v });
  for (const [slug, v] of mapHeroes) updates.set(slug, { ...(updates.get(slug) || { slug }), ...v });

  if (updates.size) {
    console.log('Atualizando tabela sites...');
    for (const u of updates.values()) {
      // Busca nome e url atuais para respeitar not-null
      const { data: existing, error: selErr } = await supabase
        .from('sites')
        .select('name, url')
        .eq('slug', u.slug)
        .maybeSingle();
      if (selErr) {
        console.error('Falha buscar site', u.slug, selErr.message);
        continue;
      }
      const payload = { slug: u.slug, name: existing?.name || u.slug, url: existing?.url || '', ...u };
      const { error } = await supabase.from('sites').upsert(payload, { onConflict: 'slug' });
      if (error) console.error('Falha atualizar site', u.slug, error.message);
      else console.log('✔ Atualizado site', u.slug);
    }
  }

  console.log('Concluído.');
}

main().catch((e) => { console.error(e); process.exit(1); });


