"use client";
import type { SiteItem } from "@/lib/site";
import { Card } from "./Card";

type Props = {
  title: string;
  sites: SiteItem[];
};

export function Row({ title, sites }: Props) {
  if (!sites || sites.length === 0) return null;

  const scrollLeft = () => {
    const container = document.querySelector(`[data-row="${title}"]`) as HTMLElement;
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector(`[data-row="${title}"]`) as HTMLElement;
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      </div>
      
      <div
        data-row={title}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-p-4 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {sites.map((site) => (
          <Card key={site.slug} item={site} />
        ))}
      </div>
      
      {/* Botões de scroll condicionais */}
      {sites.length > 4 && (
        <>
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Rolar para esquerda"
          >
            ◀
          </button>
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
            aria-label="Rolar para direita"
          >
            ▶
          </button>
        </>
      )}
    </div>
  );
}

