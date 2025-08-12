import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
import { getSupabase } from "@/lib/supabase";

type CommentItem = {
  id: string;
  slug: string;
  name: string;
  message: string;
  created_at: string;
  status?: 'pending' | 'approved' | 'rejected';
};

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs são obrigatórios" }, { status: 400 });
    }

    const supabase = getSupabase();
    if (supabase && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      // Verificar se os IDs são UUIDs válidos
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validUuids = ids.filter(id => uuidRegex.test(id));
      
      if (validUuids.length > 0) {
        try {
          // Deletar comentários em lotes para evitar erro de URI muito grande
          const batchSize = 50;

          for (let i = 0; i < validUuids.length; i += batchSize) {
            const batch = validUuids.slice(i, i + batchSize);
            
            const { error } = await supabase
              .from("comments")
              .delete()
              .in("id", batch);

            if (error) {
              console.error("Erro ao deletar lote no Supabase:", error);
              break;
            }
          }
        } catch (e) {
          console.error("Erro no Supabase:", e);
        }
      }
    }

    // Fallback para arquivo local
    const file = getDataFilePath("comments.json");
    const all = await readJsonFile<CommentItem[]>(file, []);
    const filtered = all.filter((c) => !ids.includes(c.id));
    
    await writeJsonFile(file, filtered);

    return NextResponse.json({ 
      success: true, 
      deletedCount: ids.length 
    });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
