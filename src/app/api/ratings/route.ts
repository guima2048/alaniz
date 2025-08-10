import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";

type RatingItem = { slug: string; score: number; count: number };

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const supabase = getSupabase();
  if (supabase) {
    if (slug) {
      const { data, error } = await supabase
        .from("ratings")
        .select("slug, score, count")
        .eq("slug", slug)
        .maybeSingle();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data || { slug, score: 0, count: 0 });
    }
    const { data, error } = await supabase.from("ratings").select("slug, score, count");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  }
  const file = getDataFilePath("ratings.json");
  const list = await readJsonFile<RatingItem[]>(file, []);
  if (slug) {
    const item = list.find((r) => r.slug === slug) || { slug, score: 0, count: 0 };
    return NextResponse.json(item);
  }
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { slug?: string; score?: number };
  if (!body.slug || typeof body.score !== "number") return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = getSupabase();
  if (supabase) {
    // Upsert lógica: busca atual, recalcula e salva
    const { data: existing, error: e1 } = await supabase
      .from("ratings")
      .select("slug, score, count")
      .eq("slug", body.slug)
      .maybeSingle();
    if (e1) return NextResponse.json({ error: e1.message }, { status: 500 });
    let next: RatingItem;
    if (!existing) next = { slug: body.slug, score: body.score, count: 1 };
    else {
      const total = existing.score * existing.count + body.score;
      next = { slug: existing.slug, count: existing.count + 1, score: Number((total / (existing.count + 1)).toFixed(2)) };
    }
    const { error: e2 } = await supabase.from("ratings").upsert(next, { onConflict: "slug" });
    if (e2) return NextResponse.json({ error: e2.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const file = getDataFilePath("ratings.json");
  const list = await readJsonFile<RatingItem[]>(file, []);
  const existing = list.find((r) => r.slug === body.slug);
  if (!existing) {
    list.push({ slug: body.slug, score: body.score, count: 1 });
  } else {
    const total = existing.score * existing.count + body.score;
    existing.count += 1;
    existing.score = Number((total / existing.count).toFixed(2));
  }
  await writeJsonFile(file, list);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  // Atualização administrativa para definir nota média e contagem manualmente
  const body = (await req.json().catch(() => ({}))) as RatingItem;
  if (!body.slug || typeof body.score !== "number" || typeof body.count !== "number") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const supabase = getSupabase();
  if (supabase) {
    const { error } = await supabase.from("ratings").upsert(body, { onConflict: "slug" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }
  const file = getDataFilePath("ratings.json");
  const list = await readJsonFile<RatingItem[]>(file, []);
  const idx = list.findIndex((r) => r.slug === body.slug);
  if (idx === -1) list.push(body);
  else list[idx] = body;
  await writeJsonFile(file, list);
  return NextResponse.json({ ok: true });
}


