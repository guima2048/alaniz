import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Função para buscar imagem de um site
async function fetchImageFromSite(url: string) {
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

    return { 
      success: true, 
      imageUrl,
      found: !!imageUrl 
    };

  } catch (error) {
    console.error("Erro ao buscar imagem:", error);
    return { 
      success: false,
      error: "Falha ao buscar imagem do site",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

export async function POST(req: NextRequest) {
  const { url, type, slug } = await req.json();
  
  console.log(`🔄 Processando: ${url} (${type}) para ${slug}`);
  
  if (!url || !type || !slug) {
    return NextResponse.json({ error: "URL, tipo e slug são obrigatórios" }, { status: 400 });
  }

  try {
    // 1. Buscar imagem do site
    console.log(`🔍 Buscando imagem de: ${url}`);
    const fetchData = await fetchImageFromSite(url);
    console.log(`📡 Resultado da busca:`, fetchData);
    
    if (!fetchData.success || !fetchData.imageUrl) {
      console.log(`❌ Nenhuma imagem encontrada para: ${url}`);
      return NextResponse.json({ error: "Não foi possível encontrar imagem no site" }, { status: 404 });
    }

    // 2. Baixar a imagem
    console.log(`⬇️ Baixando imagem de: ${fetchData.imageUrl}`);
    const imageResponse = await fetch(fetchData.imageUrl);
    console.log(`📥 Status do download:`, imageResponse.status, imageResponse.statusText);
    
    if (!imageResponse.ok) {
      console.log(`❌ Falha ao baixar imagem: ${imageResponse.status}`);
      return NextResponse.json({ error: "Falha ao baixar imagem" }, { status: 500 });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // 3. Determinar extensão baseada no content-type
    let extension = '.jpg';
    if (contentType.includes('png')) extension = '.png';
    else if (contentType.includes('svg')) extension = '.svg';
    else if (contentType.includes('webp')) extension = '.webp';
    else if (contentType.includes('gif')) extension = '.gif';

    // 4. Gerar nome do arquivo
    const filename = `${slug}-${Date.now()}${extension}`;
    
    // 5. Salvar no Supabase Storage
    console.log(`💾 Tentando salvar no Supabase: ${type}/${filename}`);
    const supabase = getSupabase();
    if (supabase) {
      console.log(`✅ Supabase disponível, salvando...`);
      const { error } = await supabase.storage
        .from("media")
        .upload(`${type}/${filename}`, imageBuffer, {
          contentType,
          upsert: false,
        });

      if (error) {
        console.error("❌ Erro ao salvar no Supabase:", error);
        return NextResponse.json({ error: "Falha ao salvar imagem" }, { status: 500 });
      }

      const { data: urlData } = supabase.storage.from("media").getPublicUrl(`${type}/${filename}`);
      
      console.log(`✅ Imagem salva com sucesso no Supabase: ${urlData.publicUrl}`);
      
      return NextResponse.json({ 
        success: true, 
        path: urlData.publicUrl,
        filename,
        originalUrl: fetchData.imageUrl
      });
    }

    // Fallback: salvar localmente
    try {
      const fs = await import('node:fs/promises');
      const path = await import('node:path');
      
      const publicDir = path.join(process.cwd(), 'public', type);
      await fs.mkdir(publicDir, { recursive: true });
      
      const filePath = path.join(publicDir, filename);
      await fs.writeFile(filePath, imageBuffer);
      
      return NextResponse.json({ 
        success: true, 
        path: `/${type}/${filename}`,
        filename,
        originalUrl: fetchData.imageUrl
      });
    } catch (fsError) {
      console.error("Erro ao salvar localmente:", fsError);
      return NextResponse.json({ 
        error: "Falha ao salvar imagem localmente",
        details: "Sistema de arquivos não disponível"
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Erro ao buscar e salvar imagem:", error);
    return NextResponse.json({ 
      error: "Falha ao processar imagem",
      details: error instanceof Error ? error.message : "Erro desconhecido"
    }, { status: 500 });
  }
}
