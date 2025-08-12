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
  if (sitesCache) {
    return sitesCache;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/sites`, {
      next: { revalidate: 3600 } // Cache por 1 hora
    });
    
    if (response.ok) {
      const data = await response.json();
      sitesCache = data;
      return data;
    }
  } catch (error) {
    console.error('Erro ao buscar sites:', error);
  }

  return [];
}

export async function getCategories(): Promise<Category[]> {
  if (categoriesCache) {
    return categoriesCache;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, {
      next: { revalidate: 3600 } // Cache por 1 hora
    });
    
    if (response.ok) {
      const data = await response.json();
      categoriesCache = data;
      return data;
    }
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
  }

  return [];
}

// Função para limpar cache (útil para desenvolvimento)
export function clearCache() {
  sitesCache = null;
  categoriesCache = null;
}
