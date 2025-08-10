import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from("media").list("logos");
      if (error) throw error;
      const items = (data || []).map((f) => {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(`logos/${f.name}`);
        return urlData.publicUrl;
      });
      return NextResponse.json(items);
    } catch (e) {
      console.error("Supabase Storage error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const logosDir = path.join(process.cwd(), "public", "logos");
  const files = fs.existsSync(logosDir) ? fs.readdirSync(logosDir) : [];
  const items = files.map((f) => "/logos/" + f);
  return NextResponse.json(items);
}

function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ ok: false }, { status: 400 });
  const file = form.get("file") as unknown as File | null;
  if (!file) return NextResponse.json({ ok: false, error: "missing file" }, { status: 400 });
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".bin";
  const base = sanitizeFilename(path.basename(file.name, ext)) || "logo";
  const filename = `${base}-${Date.now()}${ext}`;
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.storage
        .from("media")
        .upload(`logos/${filename}`, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(`logos/${filename}`);
      return NextResponse.json({ ok: true, path: urlData.publicUrl });
    } catch (e) {
      console.error("Supabase Storage error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const dir = path.join(process.cwd(), "public", "logos");
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ ok: true, path: `/logos/${filename}` });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const p = url.searchParams.get("path");
  if (!p) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Extrair nome do arquivo da URL ou path
      let filename = p;
      if (p.startsWith("/logos/")) {
        filename = p.replace("/logos/", "");
      } else if (p.includes("/storage/v1/object/public/media/logos/")) {
        filename = p.split("/logos/")[1];
      }
      
      const { error } = await supabase.storage.from("media").remove([`logos/${filename}`]);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase Storage error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  if (!p.startsWith("/logos/")) return NextResponse.json({ ok: false }, { status: 400 });
  const target = path.join(process.cwd(), "public", p);
  const publicDir = path.join(process.cwd(), "public");
  const normalized = path.normalize(target);
  if (!normalized.startsWith(publicDir)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    await fsp.unlink(normalized);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
}


