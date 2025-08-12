import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GTMNoScript, GTMSnippet, GA4Snippet } from "@/lib/gtm";
import { ConsentBanner } from "@/components/ConsentBanner";

import { defaultMetadata } from "@/lib/seo";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* CSS Crítico para prevenir CLS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Prevenção de CLS - Dimensões críticas */
              .aspect-ratio-reserved {
                aspect-ratio: 16/9;
                width: 100%;
                height: auto;
              }
              
              .card-container {
                height: 144px;
                width: 240px;
                min-width: 240px;
                max-width: 240px;
              }
              
              .card-image-container {
                height: 144px;
                width: 100%;
              }
              
              .rating-badge {
                min-width: 60px;
                min-height: 20px;
              }
              
              .site-rating {
                min-width: 120px;
                min-height: 20px;
              }
              
              .consent-banner {
                min-height: 80px;
              }
              
              .alaniz-text {
                min-height: 80px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              
              /* Prevenção de layout shift para imagens */
              img {
                max-width: 100%;
                height: auto;
                display: block;
              }
              
              /* Garantir que elementos tenham dimensões consistentes */
              .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                min-height: 40px;
              }
            `,
          }}
        />
        
        {/* Favicons otimizados */}
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        
        {/* GTM e GA4 otimizados */}
        <GTMSnippet />
        <GA4Snippet />
      </head>
      <body className="bg-[#FAFAF7] text-neutral-900 antialiased">
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
