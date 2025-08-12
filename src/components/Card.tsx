"use client";
import Link from "next/link";
import { RatingBadge } from "./RatingBadge";
import { CardImage } from "./OptimizedImage";

type Props = {
  item: {
    slug: string;
    name: string;
    cover: string;
    logo: string;
    short_desc: string | null;
    rating_avg?: number | null;
    rating_count?: number | null;
  };
};

export function Card({ item }: Props) {
  return (
    <div className="flex flex-col items-center">
      <Link
        href={`/${item.slug}`}
        className="card-container snap-start"
        aria-label={`Abrir ${item.name}`}
      >
        <div className="group relative rounded-lg overflow-hidden shadow-sm bg-white transition-transform duration-200 will-change-transform hover:scale-[1.02] hover:-translate-y-0.5 border border-neutral-200">
          <div className="card-image-container bg-neutral-200">
            <CardImage
              src={item.cover}
              alt={item.name}
              className="h-full w-full"
            />
            <div className="absolute top-2 left-2">
              <RatingBadge avg={item.rating_avg || 0} count={item.rating_count || 0} />
            </div>
          </div>
        </div>
      </Link>
      <div className="mt-2 text-center">
        <p className="font-bold text-sm text-neutral-900 truncate max-w-[240px]">
          {item.name}
        </p>
      </div>
    </div>
  );
}

