#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickColor(slug) {
  // Paleta simples e estável
  const colors = [
    '#111827', '#1F2937', '#374151', '#4B5563', '#065F46', '#047857', '#2563EB', '#7C3AED', '#BE185D', '#B45309', '#0F766E'
  ];
  const idx = hashString(slug) % colors.length;
  return colors[idx];
}

function getInitials(name) {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return 'SR'; // Sites Relacionamento
}

function makeLogoSVG({ text, bg }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="32" fill="${bg}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-family="Inter, Arial, sans-serif" font-size="96" font-weight="700" fill="#ffffff">${text}</text>
</svg>`;
}

function makeCoverSVG({ name, initials, bg }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="60" y="360" font-family="Inter, Arial, sans-serif" font-size="160" font-weight="800" fill="#ffffff" opacity="0.15">${initials}</text>
  <text x="60" y="460" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="700" fill="#ffffff">${name}</text>
  <text x="60" y="510" font-family="Inter, Arial, sans-serif" font-size="20" fill="#E5E7EB">Capa gerada automaticamente</text>
  
  <circle cx="1080" cy="120" r="60" fill="#111827" opacity="0.25"/>
  <circle cx="1020" cy="210" r="30" fill="#111827" opacity="0.25"/>
  <circle cx="1110" cy="220" r="25" fill="#111827" opacity="0.25"/>
  
  <rect x="60" y="80" width="140" height="140" rx="24" fill="#FFFFFF22"/>
  <text x="130" y="165" text-anchor="middle" dominant-baseline="central" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF">${initials}</text>
  
  <text x="60" y="580" font-family="Inter, Arial, sans-serif" font-size="14" fill="#9CA3AF">alaniz.dev</text>
</svg>`;
}

function makeHeroSVG({ initials, bg }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="320" viewBox="0 0 1200 320">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="320" fill="url(#g)"/>
  <text x="60" y="210" font-family="Inter, Arial, sans-serif" font-size="140" font-weight="800" fill="#ffffff" opacity="0.15">${initials}</text>
</svg>`;
}

async function readSites() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anon) {
    try {
      const supabase = createClient(url, anon, { auth: { persistSession: false } });
      const { data, error } = await supabase.from('sites').select('*');
      if (!error && Array.isArray(data)) return { list: data, supabase };
    } catch (e) {
      console.warn('⚠️ Supabase indisponível, usando arquivo local.');
    }
  }
  const file = path.join(process.cwd(), 'src', 'data', 'sites.json');
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { list, supabase: null };
}

async function writeBack({ supabase, updates }) {
  if (supabase) {
    for (const u of updates) {
      const { error } = await supabase.from('sites').upsert(u, { onConflict: 'slug' });
      if (error) console.error('Erro upsert sites:', u.slug, error.message);
      else console.log('✔ Atualizado site (logo/cover):', u.slug);
    }
  } else {
    const file = path.join(process.cwd(), 'src', 'data', 'sites.json');
    let current = [];
    try { current = JSON.parse(fs.readFileSync(file, 'utf8')); } catch {}
    const bySlug = new Map(current.map((s) => [s.slug, s]));
    for (const u of updates) bySlug.set(u.slug, { ...bySlug.get(u.slug), ...u });
    fs.writeFileSync(file, JSON.stringify(Array.from(bySlug.values()), null, 2), 'utf8');
    console.log('✔ src/data/sites.json atualizado');
  }
}

async function main() {
  const root = process.cwd();
  const logosDir = path.join(root, 'public', 'logos');
  const coversDir = path.join(root, 'public', 'covers');
  const heroesDir = path.join(root, 'public', 'heroes');
  ensureDir(logosDir);
  ensureDir(coversDir);
  ensureDir(heroesDir);

  const { list, supabase } = await readSites();
  // Filtro opcional por slug: --slug=a,b,c ou SLUG env
  const arg = process.argv.slice(2).find((a) => a.startsWith('--slug='));
  const envSlug = process.env.SLUG;
  let filter = null;
  if (arg) filter = arg.split('=')[1];
  if (!filter && envSlug) filter = envSlug;
  let targets = list;
  if (filter) {
    const set = new Set(String(filter).split(',').map((s) => s.trim()).filter(Boolean));
    targets = list.filter((s) => set.has(String(s.slug)));
    console.log('Filtrando slugs:', Array.from(set).join(', '));
  }
  const updates = [];

  for (const site of targets) {
    const slug = String(site.slug || '').trim();
    const name = String(site.name || slug || 'Site');
    if (!slug) continue;
    const initials = getInitials(name);
    const bg = pickColor(slug);

    const logoPath = path.join(logosDir, `${slug}.svg`);
    if (!fs.existsSync(logoPath)) {
      fs.writeFileSync(logoPath, makeLogoSVG({ text: initials, bg }), 'utf8');
      console.log('✔ Logo gerado:', path.relative(root, logoPath));
    }

    const coverPath = path.join(coversDir, `${slug}.svg`);
    if (!fs.existsSync(coverPath)) {
      fs.writeFileSync(coverPath, makeCoverSVG({ name, initials, bg }), 'utf8');
      console.log('✔ Capa gerada:', path.relative(root, coverPath));
    }

    const heroPath = path.join(heroesDir, `${slug}.svg`);
    if (!fs.existsSync(heroPath)) {
      fs.writeFileSync(heroPath, makeHeroSVG({ initials, bg }), 'utf8');
      console.log('✔ Hero gerado:', path.relative(root, heroPath));
    }

    const url = String(site.url || '').trim();
    const next = { slug, name, url };
    if (!site.logo) next.logo = `/logos/${slug}.svg`;
    if (!site.cover) next.cover = `/covers/${slug}.svg`;
    // hero opcional
    if (!site.hero) next.hero = `/heroes/${slug}.svg`;

    // Não sobrescrever existentes
    const needsUpdate = Boolean(next.logo || next.cover || next.hero);
    if (needsUpdate) {
      if (!next.url) {
        console.warn('⚠️ Sem URL; pulando upsert do site (apenas arquivos gerados):', slug);
      } else {
        updates.push(next);
      }
    }
  }

  if (updates.length) {
    await writeBack({ supabase, updates });
  } else {
    console.log('Nada para atualizar nos registros.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


