import { NextResponse } from "next/server";
import { getSites } from "@/lib/fsData";

export async function GET() {
  try {
    const sites = await getSites();
    
    // Retornar apenas os dados necessários para a página de relatórios
    const sitesData = sites.map((site: Record<string, unknown>) => ({
      slug: site.slug,
      name: site.name,
      url: site.url,
      logo: site.logo,
      cover: site.cover,
      hero: site.hero
    }));

    return NextResponse.json(sitesData);
  } catch (error) {
    console.error("Erro ao buscar sites:", error);
    return NextResponse.json({ error: "Falha ao buscar sites" }, { status: 500 });
  }
}
