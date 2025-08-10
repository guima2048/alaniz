import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";

export type PostItem = {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover?: string;
  published_at?: string; // ISO
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      if (slug) {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("slug", slug)
          .single();
        if (error) throw error;
        if (!data) return NextResponse.json({ ok: false }, { status: 404 });
        return NextResponse.json(data);
      } else {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("published_at", { ascending: false });
        if (error) throw error;
        return NextResponse.json(data || []);
      }
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const file = getDataFilePath("posts.json");
  const posts = await readJsonFile<PostItem[]>(file, []);
  if (slug) {
    const p = posts.find((it) => it.slug === slug);
    if (!p) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json(p);
  }
  return NextResponse.json(posts);
}

export async function PUT(req: NextRequest) {
  const post = (await req.json().catch(() => ({}))) as Partial<PostItem>;
  if (!post.slug) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("posts")
        .upsert({
          slug: String(post.slug),
          title: String(post.title || "Novo post"),
          excerpt: post.excerpt || "",
          content: post.content || "",
          cover: post.cover,
          published_at: post.published_at,
        }, { onConflict: "slug" });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const file = getDataFilePath("posts.json");
  const list = await readJsonFile<PostItem[]>(file, []);
  const idx = list.findIndex((it) => it.slug === post.slug);
  if (idx === -1) {
    list.push({
      slug: String(post.slug),
      title: String(post.title || "Novo post"),
      excerpt: post.excerpt || "",
      content: post.content || "",
      cover: post.cover,
      published_at: post.published_at,
    });
  } else {
    list[idx] = { ...list[idx], ...post } as PostItem;
  }
  await writeJsonFile(file, list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("posts")
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
  const file = getDataFilePath("posts.json");
  const list = await readJsonFile<PostItem[]>(file, []);
  const next = list.filter((it) => it.slug !== slug);
  await writeJsonFile(file, next);
  return NextResponse.json({ ok: true });
}



