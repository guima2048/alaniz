'use client';

import { useEffect } from 'react';

export function CriticalCSS() {
  useEffect(() => {
    // Carregar CSS não crítico de forma assíncrona após a renderização inicial
    const loadNonCriticalCSS = () => {
      // Carregar CSS não crítico (Tailwind + estilos adicionais)
      const nonCriticalLink = document.createElement('link');
      nonCriticalLink.rel = 'stylesheet';
      nonCriticalLink.href = '/_next/static/css/non-critical.css';
      nonCriticalLink.media = 'print';
      nonCriticalLink.onload = () => {
        nonCriticalLink.media = 'all';
      };
      nonCriticalLink.onerror = () => {
        // Fallback: tentar carregar o CSS padrão do Next.js
        const fallbackLink = document.createElement('link');
        fallbackLink.rel = 'stylesheet';
        fallbackLink.href = '/_next/static/css/app.css';
        fallbackLink.media = 'print';
        fallbackLink.onload = () => {
          fallbackLink.media = 'all';
        };
        document.head.appendChild(fallbackLink);
      };
      document.head.appendChild(nonCriticalLink);
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

// CSS crítico inline para renderização imediata
export const criticalCSS = `
  body {
    background: #FAFAF7;
    color: #171717;
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  * {
    box-sizing: border-box;
  }
  
  .bg-\\[\\#FAFAF7\\] {
    background-color: #FAFAF7;
  }
  
  .text-neutral-900 {
    color: #171717;
  }
  
  .antialiased {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .min-h-\\[70vh\\] {
    min-height: 70vh;
  }
`;
