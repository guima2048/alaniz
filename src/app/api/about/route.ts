import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";

export type AboutContent = {
  title: string;
  paragraphs: string[];
};

export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("about")
        .select("*")
        .single();
      if (error) throw error;
      if (data) return NextResponse.json(data);
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const file = getDataFilePath("about.json");
  const data = await readJsonFile<AboutContent>(file, {
    title: "Sobre",
    paragraphs: [
      "Somos um projeto editorial focado em análises neutras de plataformas de relacionamento.",
    ],
  });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<AboutContent>;
  if (!body || typeof body !== "object") return NextResponse.json({ ok: false }, { status: 400 });
  
  const next: AboutContent = {
    title: typeof body.title === "string" ? body.title : "Sobre",
    paragraphs: Array.isArray(body.paragraphs) ? body.paragraphs.map(String) : [],
  };
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("about")
        .upsert(next, { onConflict: "id" });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  await writeJsonFile(getDataFilePath("about.json"), next);
  return NextResponse.json({ ok: true });
}



