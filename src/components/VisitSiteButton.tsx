"use client";

import { sendGA4Event } from "@/lib/gtm";

interface Props {
  url: string;
  slug: string;
  name: string;
  className?: string;
  children?: React.ReactNode;
}

export function VisitSiteButton({ url, slug, name, className, children }: Props) {
  const handleClick = () => {
    // Enviar evento para GTM (dataLayer)
    if (
      typeof window !== "undefined" &&
      (window as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer
    ) {
      (window as unknown as { dataLayer?: Array<Record<string, unknown>> }).dataLayer!.push({
        event: "outbound_click",
        site_slug: slug,
        site_name: name,
      });
    }

    // Enviar evento para GA4
    sendGA4Event('outbound_click', {
      site_slug: slug,
      site_name: name,
      link_url: url
    });

    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={className ?? "rounded-md bg-neutral-900 text-white px-4 py-2 hover:bg-neutral-800"}
      rel="nofollow sponsored noopener"
    >
      {children ?? "Visitar Site"}
    </button>
  );
}

