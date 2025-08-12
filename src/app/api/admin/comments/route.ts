import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";

type CommentItem = {
  id: string;
  slug: string;
  name: string;
  message: string;
  created_at: string;
  status?: 'pending' | 'approved' | 'rejected';
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const admin = searchParams.get("admin") === "true";
  
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Contar total de comentários
      const { count, error: countError } = await supabase
        .from("comments")
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error("Erro ao contar comentários:", countError);
        return NextResponse.json({ error: countError.message }, { status: 500 });
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Buscar comentários com paginação
      const { data, error } = await supabase
        .from("comments")
        .select("id, slug, name, message, created_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Erro ao buscar comentários:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Adicionar status padrão para comentários existentes
      const commentsWithStatus = (data || []).map(comment => ({
        ...comment,
        status: 'approved' as const
      }));

      return NextResponse.json({
        comments: commentsWithStatus,
        total,
        page,
        limit,
        totalPages
      });
    } catch (e) {
      console.error("Erro no Supabase:", e);
      // Fallback para arquivo local
    }
  }

  // Fallback para arquivo local
  const file = getDataFilePath("comments.json");
  const all = await readJsonFile<CommentItem[]>(file, []);
  
  const total = all.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const comments = all.slice(startIndex, endIndex);

  return NextResponse.json({
    comments,
    total,
    page,
    limit,
    totalPages
  });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  
  if (!id) {
    return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", id);
      
      if (error) {
        console.error("Erro ao deletar comentário:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json({ success: true });
    } catch (e) {
      console.error("Erro no Supabase:", e);
      // Fallback para arquivo local
    }
  }

  // Fallback para arquivo local
  const file = getDataFilePath("comments.json");
  const all = await readJsonFile<CommentItem[]>(file, []);
  const filtered = all.filter((c) => c.id !== id);
  
  await writeJsonFile(file, filtered);
  return NextResponse.json({ success: true });
}
