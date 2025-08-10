import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";
import { getCurrentDateSP } from "@/lib/date";

type CommentItem = {
  id: string;
  slug: string;
  name: string;
  message: string;
  createdAt: string; // ISO
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim();
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("comments")
      .select("id, slug, name, message, createdAt")
      .eq("slug", slug)
      .order("createdAt", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data || []) as CommentItem[]);
  }
  const file = getDataFilePath("comments.json");
  const all = await readJsonFile<CommentItem[]>(file, []);
  const list = all.filter((c) => c.slug === slug).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<CommentItem>;
    const slug = String(body.slug || "").trim();
    const name = String(body.name || "").trim().slice(0, 80);
    const message = String(body.message || "").trim().slice(0, 1000);
    if (!slug || !name || !message) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }
    const now = getCurrentDateSP().toISOString();
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from("comments")
        .insert({ slug, name, message, createdAt: now })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data as CommentItem, { status: 201 });
    }
    const file = getDataFilePath("comments.json");
    const all = await readJsonFile<CommentItem[]>(file, []);
    const item: CommentItem = {
      id: `${now}-${Math.random().toString(36).slice(2, 10)}`,
      slug,
      name,
      message,
      createdAt: now,
    };
    all.push(item);
    await writeJsonFile(file, all);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
}


