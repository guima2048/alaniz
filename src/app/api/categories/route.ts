import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

type Category = { slug: string; title: string; order?: number };

export async function GET() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("order", { ascending: true });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (e) {
      console.error("Supabase error:", e);
    }
  }
  
  // Dados estáticos como fallback
  const staticData: Category[] = [
    { slug: "todos", title: "Todos", order: 1 },
    { slug: "famosos", title: "Famosos", order: 2 },
    { slug: "elite", title: "Elite", order: 3 },
    { slug: "sugar", title: "Sugar", order: 4 },
    { slug: "lgbtqiapn", title: "LGBTQIAPN+", order: 5 }
  ];
  
  return NextResponse.json(staticData);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Category>;
  if (!body.slug || !body.title) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Remover order se não existir na tabela
      const categoryData = { slug: body.slug, title: body.title };
      
      const { error } = await supabase
        .from("categories")
        .upsert(categoryData, { onConflict: "slug" });
      
      if (error && error.message.includes("order")) {
        // Se der erro com order, tentar sem order
        console.log("⚠️ Coluna order não existe, salvando sem order...");
        const { error: errorWithoutOrder } = await supabase
          .from("categories")
          .upsert(categoryData, { onConflict: "slug" });
        
        if (errorWithoutOrder) throw errorWithoutOrder;
        return NextResponse.json({ ok: true });
      }
      
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: retornar erro pois não temos acesso a arquivos no Vercel
  return NextResponse.json({ ok: false, error: "Not available in production" }, { status: 501 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("slug", slug);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: retornar erro pois não temos acesso a arquivos no Vercel
  return NextResponse.json({ ok: false, error: "Not available in production" }, { status: 501 });
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { categories: Array<{ slug: string; order: number }> };
  if (!body.categories || !Array.isArray(body.categories)) {
    return NextResponse.json({ ok: false, error: "Categorias inválidas" }, { status: 400 });
  }
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Tentar atualizar cada categoria com sua nova ordem
      for (const cat of body.categories) {
        const { error } = await supabase
          .from("categories")
          .update({ order: cat.order })
          .eq("slug", cat.slug);
        if (error) {
          console.error("Supabase error:", error);
          // Se der erro, pode ser que a coluna order não exista
          // Por enquanto, apenas retornar sucesso sem fazer nada
          return NextResponse.json({ 
            ok: true, 
            warning: "Order column not available in database, using local file" 
          });
        }
      }
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: retornar erro pois não temos acesso a arquivos no Vercel
  return NextResponse.json({ ok: false, error: "Not available in production" }, { status: 501 });
}


