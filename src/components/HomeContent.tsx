"use client";
import { Row } from "./Row";
import type { SiteItem } from "@/lib/site";

type Category = {
  slug: string;
  title: string;
  order?: number;
};

export function HomeContent({ sites, categories }: { sites: SiteItem[]; categories: Category[] }) {
  // Ordenar sites por rating (sem useMemo para máxima performance)
  const sortedSites = sites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));

  // Ordenar categorias pelo campo order (seguindo a ordem definida no admin)
  const sortedCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8">
      {/* Mostrar "Todos os Sites" primeiro */}
      {(() => {
        const todosCategory = sortedCategories.find(c => c.slug === 'todos');
        if (todosCategory) {
          return (
            <Row 
              key="todos" 
              title={todosCategory.title} 
              sites={sortedSites} 
            />
          );
        }
        return null;
      })()}
      
      {/* Mostrar outras categorias na ordem definida */}
      {sortedCategories
        .filter(c => c.slug !== 'todos')
        .map((c) => {
          const categorySites = sites.filter((s) => (s.categories || []).includes(c.slug));
          const sortedCategorySites = categorySites.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
          
          return (
            <Row 
              key={c.slug} 
              title={c.title} 
              sites={sortedCategorySites} 
            />
          );
        })}
    </div>
  );
}
