'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholder?: 'blur' | 'empty';
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width = 640,
  height = 360,
  className = '',
  priority = false,
  loading = 'lazy',
  placeholder = 'empty',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Se a imagem é externa ou não suportada pelo next/image, usar img normal
  if (src.startsWith('http') || src.includes('data:') || !src.startsWith('/')) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'animate-pulse bg-gray-200' : ''}`}
        loading={loading}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        style={{
          aspectRatio: `${width}/${height}`,
          objectFit: 'cover'
        }}
      />
    );
  }

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${width}/${height}` }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={loading}
        placeholder={placeholder}
        sizes={sizes}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '100%'
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-gray-500 text-sm">
          Erro ao carregar imagem
        </div>
      )}
    </div>
  );
}

// Componente específico para imagens hero (LCP)
export function HeroImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={630}
      className={className}
      priority={true}
      loading="eager"
      sizes="100vw"
    />
  );
}

// Componente para imagens de card
export function CardImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={240}
      height={144}
      className={className}
      priority={false}
      loading="lazy"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// Componente para logos
export function LogoImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={24}
      height={24}
      className={className}
      priority={false}
      loading="lazy"
      sizes="24px"
    />
  );
}
