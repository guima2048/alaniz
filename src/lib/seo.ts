import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(" https://example.com"),
  title: {
    default: "ALANIZ",
    template: "%s • ALANIZ",
  },
  description:
    "Avaliações neutras e diretório estático de plataformas de relacionamento, com foco em privacidade e qualidade.",
  openGraph: {
    type: "website",
    title: "ALANIZ",
    description:
      "Avaliações neutras e diretório estático de plataformas de relacionamento.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ALANIZ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export function siteTitle(t: string) {
  return `${t} • ALANIZ`;
}




