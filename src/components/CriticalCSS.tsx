'use client';

import { useEffect } from 'react';

export function CriticalCSS() {
  useEffect(() => {
    // Carregar CSS não crítico de forma assíncrona após a renderização inicial
    const loadNonCriticalCSS = () => {
      // Verificar se o CSS já foi carregado
      if (document.querySelector('link[href*="non-critical.css"]')) {
        return;
      }

      // Carregar CSS não crítico personalizado de forma não-bloqueante
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = '/non-critical.css';
      cssLink.media = 'print';
      cssLink.onload = () => {
        // Mudar para 'all' após carregamento para aplicar os estilos
        cssLink.media = 'all';
        // Adicionar classe para indicar que o CSS foi carregado
        document.documentElement.classList.add('css-loaded');
      };
      cssLink.onerror = () => {
        // Se falhar, tentar carregar o CSS padrão do Next.js como fallback
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = '/_next/static/css/app.css';
        fallbackLink.media = 'print';
        fallbackLink.onload = () => {
          fallbackLink.media = 'all';
          document.documentElement.classList.add('css-loaded');
        };
        fallbackLink.onerror = () => {
          console.warn('CSS não crítico não pôde ser carregado');
        };
        document.head.appendChild(fallbackLink);
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
