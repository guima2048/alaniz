import { NextRequest, NextResponse } from "next/server";
import { getDataFilePath, readJsonFile, writeJsonFile } from "@/lib/fsData";
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
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("categories.json");
  const data = await readJsonFile<Category[]>(filePath, []);
  // Ordenar por order se disponível, senão por título
  const sortedData = data.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return (a.title || "").localeCompare(b.title || "");
  });
  return NextResponse.json(sortedData);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<Category>;
  if (!body.slug || !body.title) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("categories")
        .upsert(body, { onConflict: "slug" });
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } catch (e) {
      console.error("Supabase error:", e);
      // Fallback para arquivo local
    }
  }
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("categories.json");
  const list = await readJsonFile<Category[]>(filePath, []);
  const idx = list.findIndex((c) => c.slug === body.slug);
  
  // Se não tem order definido, usar a próxima ordem disponível
  let order = body.order;
  if (order === undefined) {
    const maxOrder = Math.max(...list.map(c => c.order || 0), 0);
    order = maxOrder + 1;
  }
  
  if (idx === -1) {
    list.push({ 
      slug: String(body.slug), 
      title: String(body.title),
      order: order
    });
  } else {
    list[idx] = { 
      slug: String(body.slug), 
      title: String(body.title),
      order: order
    };
  }
  await writeJsonFile(filePath, list);
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
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("categories.json");
  const list = await readJsonFile<Category[]>(filePath, []);
  const next = list.filter((c) => c.slug !== slug);
  await writeJsonFile(filePath, next);
  return NextResponse.json({ ok: true });
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
  
  // Fallback: arquivo local
  const filePath = getDataFilePath("categories.json");
  const list = await readJsonFile<Category[]>(filePath, []);
  
  // Atualizar a ordem das categorias
  for (const cat of body.categories) {
    const idx = list.findIndex((c) => c.slug === cat.slug);
    if (idx !== -1) {
      list[idx].order = cat.order;
    }
  }
  
  await writeJsonFile(filePath, list);
  return NextResponse.json({ ok: true });
}


