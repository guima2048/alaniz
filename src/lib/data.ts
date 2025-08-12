import type { SiteItem } from "./site";

type Category = {
  slug: string;
  title: string;
  order?: number;
};

// Cache em memória para dados estáticos
let sitesCache: SiteItem[] | null = null;
let categoriesCache: Category[] | null = null;

export async function getSites(): Promise<SiteItem[]> {
  // No desenvolvimento, sempre buscar dados frescos
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && sitesCache) {
    return sitesCache;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`🔍 Buscando sites de: ${baseUrl}/api/sites`);
    
    const response = await fetch(`${baseUrl}/api/sites`, {
      next: { revalidate: isDev ? 0 : 300 } // Cache por 5 minutos no Vercel, sem cache no dev
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Sites carregados: ${data.length} sites`);
      sitesCache = data;
      return data;
    } else {
      console.error(`❌ Erro HTTP ao buscar sites: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar sites:', error);
  }

  return [];
}

export async function getCategories(): Promise<Category[]> {
  // No desenvolvimento, sempre buscar dados frescos
  const isDev = process.env.NODE_ENV === 'development';
  
  if (!isDev && categoriesCache) {
    return categoriesCache;
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    console.log(`🔍 Buscando categorias de: ${baseUrl}/api/categories`);
    
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: isDev ? 0 : 300 } // Cache por 5 minutos no Vercel, sem cache no dev
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Categorias carregadas: ${data.length} categorias`);
      categoriesCache = data;
      return data;
    } else {
      console.error(`❌ Erro HTTP ao buscar categorias: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error);
  }

  return [];
}

// Função para limpar cache (útil para desenvolvimento)
export function clearCache() {
  sitesCache = null;
  categoriesCache = null;
}
