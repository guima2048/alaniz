import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(" https://example.com"),
  title: {
    default: "ALANIZ.COM.BR",
    template: "%s • ALANIZ.COM.BR",
  },
  description:
    "Avaliações neutras e diretório estático de plataformas de relacionamento, com foco em privacidade e qualidade.",
  openGraph: {
    type: "website",
    title: "ALANIZ.COM.BR",
    description:
      "Avaliações neutras e diretório estático de plataformas de relacionamento.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "ALANIZ.COM.BR",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export function siteTitle(t: string) {
  return `${t} • ALANIZ.COM.BR`;
}




