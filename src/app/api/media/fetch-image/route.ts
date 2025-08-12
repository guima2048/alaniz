import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  
  if (!url) {
    return NextResponse.json({ error: "URL é obrigatória" }, { status: 400 });
  }

  try {
    // Buscar meta tags da página
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Buscar meta tags de imagem
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const twitterImageMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["'][^>]*>/i);
    
    let imageUrl = null;
    
    // Prioridade: og:image > twitter:image > favicon
    if (ogImageMatch) {
      imageUrl = ogImageMatch[1];
    } else if (twitterImageMatch) {
      imageUrl = twitterImageMatch[1];
    } else if (faviconMatch) {
      imageUrl = faviconMatch[1];
    }

    // Se a URL da imagem for relativa, converter para absoluta
    if (imageUrl && !imageUrl.startsWith('http')) {
      const baseUrl = new URL(url);
      imageUrl = new URL(imageUrl, baseUrl).href;
    }

    // Se não encontrou nenhuma imagem, tentar buscar favicon padrão
    if (!imageUrl) {
      const baseUrl = new URL(url);
      imageUrl = `${baseUrl.protocol}//${baseUrl.hostname}/favicon.ico`;
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      found: !!imageUrl 
    });

  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return NextResponse.json({ 
      error: "Falha ao buscar imagem do site",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
