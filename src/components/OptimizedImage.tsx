'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
};

export function OptimizedImage({ src, alt, width = 240, height = 144, className = "" }: Props) {
  const [error, setError] = useState(false);

  // Se não há src, mostrar placeholder
  if (!src) {
    return (
      <div 
        className={`${className} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`}
        style={{ aspectRatio: `${width}/${height}`, width: '100%', height: 'auto' }}
      >
        Sem imagem
      </div>
    );
  }

  // Para imagens externas ou data URLs, usar img tag
  if (src.startsWith('http') || src.startsWith('data:')) {
    return (
      <div className={`${className} relative`} style={{ aspectRatio: `${width}/${height}`, width: '100%', height: 'auto' }}>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
          loading="lazy"
        />
        {error && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
            Erro ao carregar imagem
          </div>
        )}
      </div>
    );
  }

  // Para imagens locais, usar next/image
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${width}/${height}`, width: '100%', height: 'auto' }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        onError={() => setError(true)}
        priority={false}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          Erro ao carregar imagem
        </div>
      )}
    </div>
  );
}

// Componente específico para imagens hero (LCP)
export function HeroImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <OptimizedImage src={src} alt={alt} width={1200} height={630} className={className} />;
}

// Componente específico para imagens de card
export function CardImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <OptimizedImage src={src} alt={alt} width={240} height={144} className={className} />;
}

// Componente específico para logos
export function LogoImage({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <OptimizedImage src={src} alt={alt} width={24} height={24} className={className} />;
}
