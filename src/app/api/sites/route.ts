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
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .order("rating_avg", { ascending: false });
      if (error) throw error;
      return NextResponse.json(data || []);
    } catch (e) {
      console.error("Supabase error:", e);
    }
  }
  
  // Dados estáticos como fallback
  const staticData: SiteItem[] = [
    {
      "slug": "bebaby",
      "name": "Bebaby",
      "url": "https://www.bebaby.app",
      "logo": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/logos/bebaby-1754961380949.svg",
      "cover": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/covers/bebaby-1754961392569.svg",
      "hero": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/heroes/bebaby-1754961406729.svg",
      "short_desc": "O BeBaby é uma plataforma reconhecida no mercado, usada por milhares de pessoas que buscam interações reais e de qualidade.",
      "categories": ["todos", "Elite", "Famosos"],
      "rating_avg": 9.2,
      "rating_count": 965
    },
    {
      "slug": "tinder",
      "name": "Tinder",
      "url": "https://tinder.com",
      "logo": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/logos/tinder.svg",
      "cover": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/covers/tinder.svg",
      "short_desc": "O Tinder é uma das plataformas mais populares para encontros online.",
      "categories": ["todos", "Famosos"],
      "rating_avg": 8.5,
      "rating_count": 15000
    },
    {
      "slug": "bumble",
      "name": "Bumble",
      "url": "https://bumble.com",
      "logo": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/logos/bumble.svg",
      "cover": "https://ijzceqcwzrylhgmixaqq.supabase.co/storage/v1/object/public/media/covers/bumble.svg",
      "short_desc": "O Bumble é uma plataforma que dá às mulheres o controle da conversa.",
      "categories": ["todos", "Famosos"],
      "rating_avg": 8.8,
      "rating_count": 8000
    }
  ];
  
  return NextResponse.json(staticData);
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<SiteItem>;
  if (!body.slug) return NextResponse.json({ ok: false }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("sites")
        .upsert(body, { onConflict: "slug" });
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
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return NextResponse.json({ ok: false, error: "slug obrigatório" }, { status: 400 });
  
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("sites")
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


