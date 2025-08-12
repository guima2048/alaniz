import { NextRequest, NextResponse } from "next/server";
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
  if (!supabase) {
    console.error("❌ Supabase não disponível");
    return NextResponse.json({ error: "Supabase não disponível" }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("❌ Erro ao buscar sites do Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!data || !Array.isArray(data)) {
      console.error("❌ Dados inválidos do Supabase");
      return NextResponse.json({ error: "Dados inválidos" }, { status: 500 });
    }
    
    console.log(`✅ Buscados ${data.length} sites do Supabase`);
    return NextResponse.json(data);
    
  } catch (e) {
    console.error("❌ Exceção ao buscar sites do Supabase:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<SiteItem>;
  if (!body.slug) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase não disponível" }, { status: 500 });
  }
  
  try {
    const { error } = await supabase
      .from("sites")
      .upsert(body, { onConflict: "slug" });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Supabase error:", e);
    return NextResponse.json({ ok: false, error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false, error: "slug obrigatório" }, { status: 400 });
  
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Supabase não disponível" }, { status: 500 });
  }
  
  try {
    const { error } = await supabase
      .from("sites")
      .delete()
      .eq("slug", slug);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Supabase error:", e);
    return NextResponse.json({ ok: false, error: "Erro ao deletar" }, { status: 500 });
  }
}


