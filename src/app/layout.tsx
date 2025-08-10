import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GTMNoScript, GTMSnippet } from "@/lib/gtm";
import { ConsentBanner } from "@/components/ConsentBanner";
import { defaultMetadata } from "@/lib/seo";

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <GTMSnippet />
      </head>
      <body className="bg-[#FAFAF7] text-neutral-900 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations()
                      .then(function(regs){ return Promise.all(regs.map(function(r){ return r.unregister(); })); })
                      .catch(function(){});
                  }
                  if (window.caches && caches.keys) {
                    caches.keys()
                      .then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
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
