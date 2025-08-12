"use client";
import Link from "next/link";
import Image from "next/image";
import { RatingBadge } from "./RatingBadge";
import type { SiteItem } from "@/lib/site";

type Props = {
  item: SiteItem;
};

// Array de fotos de homens com cara de rico
const richMenPhotos = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=300&fit=crop&crop=face"
];

export function Card({ item }: Props) {
  // Se for Bebaby, vai para o site real
  const href = item.slug === "bebaby" ? "https://www.bebaby.app" : "/site";
  
  // URL para o botão "Mais" - BeBaby vai para /bebaby, outros para /site
  const maisHref = item.slug === "bebaby" ? "/bebaby" : "/site";
  
  // Gerar as iniciais do site para o padrão de fundo
  const initials = item.name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Selecionar uma foto baseada no slug do site para consistência
  const photoIndex = item.slug.length % richMenPhotos.length;
  const selectedPhoto = richMenPhotos[photoIndex];
  
  // Título do site - apenas BeBaby mantém .app
  const siteTitle = item.slug === "bebaby" ? `${item.name}.app` : item.name;
  
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
            {/* Foto do homem rico */}
            <div className="absolute inset-0">
              <Image
                src={selectedPhoto}
                alt="Homem bem-sucedido"
                fill
                className="object-cover opacity-30"
                loading="lazy"
                sizes="140px"
              />
            </div>
            
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
            <div className="absolute top-2 left-2 z-10">
              <RatingBadge avg={item.rating_avg || 0} count={item.rating_count || 0} />
            </div>
            
            {/* Nome do site na parte inferior esquerda */}
            <div className="absolute bottom-2 left-2 z-10">
              <h3 className="text-white font-semibold text-sm drop-shadow-lg">{item.name}</h3>
              <p className="text-purple-200 text-xs opacity-80 drop-shadow-lg">Plataforma de relacionamento</p>
            </div>
            
            {/* Padrões circulares sutis no canto superior direito */}
            <div className="absolute top-2 right-2 opacity-20 z-10">
              <div className="w-8 h-8 rounded-full border-2 border-white"></div>
            </div>
            <div className="absolute top-6 right-6 opacity-15 z-10">
              <div className="w-4 h-4 rounded-full border border-white"></div>
            </div>
          </div>
          
          {/* Seção inferior branca */}
          <div className="p-3 bg-white">
            <div className="flex items-start gap-2">
              {/* Ícone quadrado roxo */}
              <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">{initials}</span>
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-neutral-900 text-xs mb-1">
                  {siteTitle}
                </h4>
                <p className="text-neutral-700 text-xs line-clamp-2 leading-relaxed">
                  {item.short_desc}
                </p>
              </div>
            </div>
            
            {/* Botões "Mais" e "Site" */}
            <div className="mt-2 flex gap-2">
              <Link
                href={maisHref}
                className="flex-1 bg-neutral-900 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-neutral-800 transition-colors text-center"
                onClick={(e) => e.stopPropagation()}
              >
                Mais
              </Link>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-purple-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-purple-700 transition-colors text-center"
                onClick={(e) => e.stopPropagation()}
              >
                Site
              </a>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

