import Script from "next/script";

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";
export const ga4 = {
  enabled: !!process.env.NEXT_PUBLIC_GA4_ID,
  id: process.env.NEXT_PUBLIC_GA4_ID || "",
};

export function GTMSnippet() {
  if (!GTM_ID) return null;
  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${GTM_ID}');
      `,
      }}
    />
  );
}

export function GA4Snippet() {
  if (!ga4.enabled || !ga4.id) return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4.id}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4.id}');
          `,
        }}
      />
    </>
  );
}

// Função para enviar eventos customizados para GA4
export function sendGA4Event(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    const gtag = (window as unknown as { gtag?: (command: string, eventName: string, parameters?: Record<string, unknown>) => void }).gtag;
    if (gtag) {
      gtag('event', eventName, parameters);
    }
  }
}

export function GTMNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}


