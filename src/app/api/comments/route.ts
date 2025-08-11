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
  status: 'pending' | 'approved' | 'rejected';
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim();
  const admin = searchParams.get("admin") === "true";
  
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });
  const supabase = getSupabase();
  if (supabase) {
    let query = supabase
      .from("comments")
      .select("id, slug, name, message, createdAt, status")
      .eq("slug", slug);
    
    // Se não for admin, só mostrar comentários aprovados
    if (!admin) {
      query = query.eq("status", "approved");
    }
    
    const { data, error } = await query.order("createdAt", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data || []) as CommentItem[]);
  }
  const file = getDataFilePath("comments.json");
  const all = await readJsonFile<CommentItem[]>(file, []);
  let list = all.filter((c) => c.slug === slug);
  
  // Se não for admin, só mostrar comentários aprovados
  if (!admin) {
    list = list.filter((c) => c.status === "approved");
  }
  
  list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
        .insert({ slug, name, message, createdAt: now, status: "pending" })
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
      status: "pending",
    };
    all.push(item);
    await writeJsonFile(file, all);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as { id: string; status: 'approved' | 'rejected' };
    const { id, status } = body;
    
    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "invalid fields" }, { status: 400 });
    }
    
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("comments")
        .update({ status })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    
    // Fallback para arquivo local
    const file = getDataFilePath("comments.json");
    const all = await readJsonFile<CommentItem[]>(file, []);
    const idx = all.findIndex((c) => c.id === id);
    if (idx === -1) return NextResponse.json({ error: "comment not found" }, { status: 404 });
    
    all[idx].status = status;
    await writeJsonFile(file, all);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
    
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    
    // Fallback para arquivo local
    const file = getDataFilePath("comments.json");
    const all = await readJsonFile<CommentItem[]>(file, []);
    const filtered = all.filter((c) => c.id !== id);
    await writeJsonFile(file, filtered);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
}


