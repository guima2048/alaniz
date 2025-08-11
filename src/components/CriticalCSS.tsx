'use client';

import { useEffect } from 'react';

export function CriticalCSS() {
  useEffect(() => {
    // Carregar CSS não crítico de forma assíncrona após a renderização inicial
    const loadNonCriticalCSS = () => {
      // Carregar CSS padrão do Next.js (que contém Tailwind)
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/_next/static/css/app.css';
      cssLink.media = 'print';
      cssLink.onload = () => {
        cssLink.media = 'all';
      };
      cssLink.onerror = () => {
        // Se falhar, não fazer nada - o CSS crítico já está inline
        console.warn('CSS não crítico não pôde ser carregado');
      };
      document.head.appendChild(cssLink);
    };

    // Carregar CSS não crítico após a renderização inicial
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
    } else {
      // Se o DOM já está carregado, aguardar um frame para não bloquear
      requestAnimationFrame(loadNonCriticalCSS);
    }
  }, []);

  return null;
}
