import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GTMNoScript, GTMSnippet } from "@/lib/gtm";
import { ConsentBanner } from "@/components/ConsentBanner";
import { defaultMetadata } from "@/lib/seo";
import { CriticalCSS } from "@/components/CriticalCSS";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* CSS Crítico inline para renderização imediata */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* CSS Crítico - Carregado inline para renderização imediata */
            
            /* Reset básico */
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            /* Estilos base críticos */
            html {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.5;
              -webkit-text-size-adjust: 100%;
              -moz-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
            
            body {
              background-color: #FAFAF7;
              color: #171717;
              font-family: inherit;
              font-size: 16px;
              line-height: 1.6;
              text-rendering: optimizeSpeed;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              overflow-x: hidden;
            }
            
            /* Classes críticas do Tailwind */
            .bg-\\[#FAFAF7\\] {
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
            
            /* Prevenção de layout shift */
            img, video, canvas, audio, iframe, embed, object {
              display: block;
              max-width: 100%;
              height: auto;
            }
            
            /* Otimizações de performance */
            a {
              color: inherit;
              text-decoration: none;
            }
            
            button {
              background: none;
              border: none;
              cursor: pointer;
              font: inherit;
            }
            
            /* FOUC prevention */
            html {
              visibility: visible;
              opacity: 1;
            }
          `
        }} />
        
        {/* Preload de recursos críticos */}
        <link rel="preload" href="/favicon.ico" as="image" type="image/x-icon" />
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
        
        {/* Favicons otimizados */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* GTM otimizado */}
        <GTMSnippet />
      </head>
      <body className="bg-[#FAFAF7] text-neutral-900 antialiased">
        {/* Componente de otimização de CSS */}
        <CriticalCSS />
        
        {/* Script de limpeza de cache movido para o final e otimizado */}
        <script
          defer
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations()
                      .then(function(regs){ 
                        return Promise.all(regs.map(function(r){ 
                          return r.unregister(); 
                        })); 
                      })
                      .catch(function(){});
                  }
                  if (window.caches && caches.keys) {
                    caches.keys()
                      .then(function(keys){ 
                        return Promise.all(keys.map(function(k){ 
                          return caches.delete(k); 
                        })); 
                      })
                      .catch(function(){});
                  }
                } catch(_) {}
              })();
            `,
          }}
        />
        <GTMNoScript />
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
        <ConsentBanner />
      </body>
    </html>
  );
}
