import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";

type SiteItem = {
  slug: string;
  name: string;
  url: string;
  logo?: string;
  cover?: string;
  hero?: string;
  short_desc?: string;
  categories?: string[];
  price_min?: number;
  price_model?: string;
  style?: string;
  audience?: string;
  privacy_level?: string;
  editorial_score?: number;
  rating_avg?: number;
  rating_count?: number;
  features?: string[];
};

export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .order("rating_avg", { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("sites.json");
  const data = await readJsonFile<SiteItem[]>(filePath, []);
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<SiteItem>;
  if (!body.slug) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("sites")
        .upsert(body, { onConflict: "slug" });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("sites.json");
  const list = await readJsonFile<SiteItem[]>(filePath, []);
  const idx = list.findIndex((s) => s.slug === body.slug);
  if (idx === -1) {
    // cria novo
    const newItem: SiteItem = {
      slug: String(body.slug),
      name: String(body.name || "Novo site"),
      url: String(body.url || ""),
      logo: body.logo,
      cover: body.cover,
      hero: body.hero,
      short_desc: body.short_desc,
      categories: Array.isArray(body.categories) ? body.categories : [],
      price_min: typeof body.price_min === "number" ? body.price_min : undefined,
      price_model: body.price_model,
      style: body.style,
      audience: body.audience,
      privacy_level: body.privacy_level,
      editorial_score: typeof body.editorial_score === "number" ? body.editorial_score : undefined,
      rating_avg: typeof body.rating_avg === "number" ? body.rating_avg : undefined,
      rating_count: typeof body.rating_count === "number" ? body.rating_count : undefined,
      features: Array.isArray(body.features) ? body.features : [],
    };
    list.push(newItem);
  } else {
    list[idx] = { ...list[idx], ...body } as SiteItem;
  }
  await writeJsonFile(filePath, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false, error: "slug obrigatório" }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("sites")
        .delete()
        .eq("slug", slug);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("sites.json");
  const list = await readJsonFile<SiteItem[]>(filePath, []);
  const next = list.filter((s) => s.slug !== slug);
  if (next.length === list.length) return NextResponse.json({ ok: false, error: "não encontrado" }, { status: 404 });
  await writeJsonFile(filePath, next);
  return NextResponse.json({ ok: true });
}


