"use client";
import Link from "next/link";
import { RatingBadge } from "./RatingBadge";
import type { SiteItem } from "@/lib/site";

type Props = {
  item: SiteItem;
};

export function Card({ item }: Props) {
  // Se for Bebaby, vai para o site real
  const href = item.slug === "bebaby" ? "https://www.bebaby.app" : "/site";
  
  // Gerar as iniciais do site para o padrão de fundo
  const initials = item.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <div className="flex flex-col items-center">
      <Link
        href={href}
        className="card-container snap-start"
        aria-label={`Abrir ${item.name}`}
        prefetch={false}
        target={item.slug === "bebaby" ? "_blank" : "_self"}
      >
        <div className="group relative rounded-lg overflow-hidden shadow-sm bg-white transition-transform duration-200 will-change-transform hover:scale-[1.02] hover:-translate-y-0.5 border border-neutral-200">
          {/* Seção superior roxa */}
          <div className="relative h-32 bg-gradient-to-br from-purple-600 to-purple-800">
            {/* Padrão de fundo com iniciais */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-3 gap-4 h-full w-full p-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Rating badge no canto superior esquerdo */}
            <div className="absolute top-2 left-2">
              <RatingBadge avg={item.rating_avg || 0} count={item.rating_count || 0} />
            </div>
            
            {/* Nome do site na parte inferior esquerda */}
            <div className="absolute bottom-2 left-2">
              <h3 className="text-white font-semibold text-sm">{item.name}</h3>
              <p className="text-purple-200 text-xs opacity-80">Plataforma de relacionamento</p>
            </div>
            
            {/* Padrões circulares sutis no canto superior direito */}
            <div className="absolute top-2 right-2 opacity-20">
              <div className="w-8 h-8 rounded-full border-2 border-white"></div>
            </div>
            <div className="absolute top-6 right-6 opacity-15">
              <div className="w-4 h-4 rounded-full border border-white"></div>
            </div>
          </div>
          
          {/* Seção inferior branca */}
          <div className="p-4 bg-white">
            <div className="flex items-start gap-3">
              {/* Ícone quadrado roxo */}
              <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">{initials}</span>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-neutral-900 text-sm mb-1">
                  {item.name}.app
                </h4>
                <p className="text-neutral-700 text-xs line-clamp-2 leading-relaxed">
                  {item.short_desc}
                </p>
              </div>
            </div>
            
            {/* Botão "Saber mais" */}
            <div className="mt-3 flex justify-center">
              <button className="bg-neutral-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-neutral-800 transition-colors">
                Saber mais
              </button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

