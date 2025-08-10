import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage.from("media").list("covers");
      if (error) throw error;
      const items = (data || []).map((f) => {
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(`covers/${f.name}`);
        return urlData.publicUrl;
      });
      return NextResponse.json(items);
    } catch (e) {
      console.error("Supabase Storage error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const coversDir = path.join(process.cwd(), "public", "covers");
  const files = fs.existsSync(coversDir) ? fs.readdirSync(coversDir) : [];
  const items = files.map((f) => "/covers/" + f);
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
  const base = sanitizeFilename(path.basename(file.name, ext)) || "cover";
  const filename = `${base}-${Date.now()}${ext}`;
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from("media")
        .upload(`covers/${filename}`, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("media").getPublicUrl(`covers/${filename}`);
      return NextResponse.json({ ok: true, path: urlData.publicUrl });
    } catch (e) {
      console.error("Supabase Storage error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const dir = path.join(process.cwd(), "public", "covers");
  await fsp.mkdir(dir, { recursive: true });
  await fsp.writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ ok: true, path: `/covers/${filename}` });
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
      if (p.startsWith("/covers/")) {
        filename = p.replace("/covers/", "");
      } else if (p.includes("/storage/v1/object/public/media/covers/")) {
        filename = p.split("/covers/")[1];
      }
      
      const { error } = await supabase.storage.from("media").remove([`covers/${filename}`]);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase Storage error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  if (!p.startsWith("/covers/")) return NextResponse.json({ ok: false }, { status: 400 });
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


