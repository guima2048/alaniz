'use client';

import { useEffect } from 'react';

export function CriticalCSS() {
  useEffect(() => {
    // Carregar CSS não crítico de forma assíncrona
    const loadNonCriticalCSS = () => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/_next/static/css/app.css'; // CSS compilado do Tailwind
      link.media = 'print';
      link.onload = () => {
        link.media = 'all';
      };
      document.head.appendChild(link);
    };

    // Carregar CSS não crítico após a renderização inicial
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadNonCriticalCSS);
    } else {
      loadNonCriticalCSS();
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
