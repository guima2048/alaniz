import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { slug, images } = await req.json();
  
  if (!slug || !images) {
    return NextResponse.json({ error: "Slug e imagens são obrigatórios" }, { status: 400 });
  }

  try {
    // Atualizar no Supabase se disponível
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase
        .from("sites")
        .update(images)
        .eq("slug", slug);

      if (error) {
        console.error("Erro ao atualizar no Supabase:", error);
        return NextResponse.json({ error: "Falha ao atualizar no Supabase" }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Site atualizado com sucesso no Supabase" 
      });
    }

    // Se não há Supabase, tentar atualizar arquivo local
    try {
      const { updateSite } = await import("@/lib/fsData");
      await updateSite(slug, images);
      
      return NextResponse.json({ 
        success: true, 
        message: "Site atualizado com sucesso no arquivo local" 
      });
    } catch (fsError) {
      console.error("Erro ao atualizar arquivo local:", fsError);
      return NextResponse.json({ 
        error: "Falha ao atualizar site",
        details: "Sistema de arquivos não disponível"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro ao atualizar site:", error);
    return NextResponse.json({ 
      error: "Falha ao atualizar site",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
