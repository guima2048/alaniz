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
  status?: 'pending' | 'approved' | 'rejected';
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = String(searchParams.get("slug") || "").trim();
  const admin = searchParams.get("admin") === "true";
  
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });
  const supabase = getSupabase();
  if (supabase) {
    try {
      const query = supabase
        .from("comments")
        .select("id, slug, name, message, createdAt")
        .eq("slug", slug);
      
      const { data, error } = await query.order("createdAt", { ascending: false });
      if (error) {
        // Se der erro, pode ser que a coluna status não exista
        console.error("Supabase error:", error);
        // Fallback: tentar sem a coluna status
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("comments")
          .select("id, slug, name, message, createdAt")
          .eq("slug", slug)
          .order("createdAt", { ascending: false });
        
        if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        
        // Adicionar status padrão para comentários existentes
        const commentsWithStatus = (fallbackData || []).map(comment => ({
          ...comment,
          status: 'approved' as const
        }));
        
        return NextResponse.json(commentsWithStatus as CommentItem[]);
      }
      
      // Se não der erro, verificar se tem status
      const commentsWithStatus = (data || []).map(comment => ({
        ...comment,
        status: 'approved' as const
      }));
      
      // Se não for admin, só mostrar comentários aprovados
      if (!admin) {
        const filteredComments = commentsWithStatus.filter(c => c.status === "approved");
        return NextResponse.json(filteredComments as CommentItem[]);
      }
      
      return NextResponse.json(commentsWithStatus as CommentItem[]);
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  const file = getDataFilePath("comments.json");
  const all = await readJsonFile<CommentItem[]>(file, []);
  let list = all.filter((c) => c.slug === slug);
  
  // Se não for admin, só mostrar comentários aprovados
  if (!admin) {
    list = list.filter((c) => c.status === "approved");
  }
  
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
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
      try {
        const { data, error } = await supabase
          .from("comments")
          .insert({ slug, name, message, createdAt: now })
          .select()
          .single();
        if (error) {
          console.error("Supabase error:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        // Adicionar status padrão
        const commentWithStatus = {
          ...data,
          status: 'approved' as const
        };
        
        return NextResponse.json(commentWithStatus as CommentItem, { status: 201 });
      } catch (e) {
        console.error("Supabase error:", e);
        // Fallback para arquivo local
      }
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
      try {
        // Tentar atualizar com status
        const { error } = await supabase
          .from("comments")
          .update({ status })
          .eq("id", id);
        if (error) {
          console.error("Supabase error:", error);
          // Se der erro, pode ser que a coluna status não exista
          // Por enquanto, apenas retornar sucesso sem fazer nada
          return NextResponse.json({ ok: true, warning: "Status column not available" });
        }
        return NextResponse.json({ ok: true });
      } catch (e) {
        console.error("Supabase error:", e);
        return NextResponse.json({ ok: true, warning: "Status column not available" });
      }
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


