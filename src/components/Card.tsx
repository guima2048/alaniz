"use client";
import Link from "next/link";
import { RatingBadge } from "./RatingBadge";
import { CardImage, LogoImage } from "./OptimizedImage";

type Props = {
  item: {
    slug: string;
    name: string;
    cover: string;
    logo: string;
    short_desc: string;
    rating_avg?: number;
    rating_count?: number;
  };
};

export function Card({ item }: Props) {
  return (
    <div className="min-w-[240px] max-w-[240px] snap-start">
      <div className="group relative rounded-lg overflow-hidden shadow-sm bg-white transition-transform duration-200 will-change-transform hover:scale-[1.02] hover:-translate-y-0.5 border border-neutral-200">
        <div className="relative h-36 w-full bg-neutral-200">
          <CardImage
            src={item.cover}
            alt={item.name}
            className="h-full w-full"
          />
          <div className="absolute top-2 left-2">
            <RatingBadge avg={item.rating_avg || 0} count={item.rating_count || 0} />
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <LogoImage
              src={item.logo}
              alt={`Logo ${item.name}`}
              className="h-6 w-6 rounded bg-white border"
            />
            <div className="font-medium truncate" title={item.name}>
              {item.name}
            </div>
          </div>
          <p className="text-sm text-neutral-700 line-clamp-2 min-h-[40px]">
            {item.short_desc}
          </p>
          <Link
            href={`/${item.slug}`}
            className="w-full inline-flex items-center justify-center rounded-md bg-neutral-900 text-white py-2 text-sm hover:bg-neutral-800"
          >
            Saber mais
          </Link>
        </div>
      </div>
    </div>
  );
}

