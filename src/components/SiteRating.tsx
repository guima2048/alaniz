"use client";

import { useEffect, useState } from "react";
import { StarRatingDisplay } from "./Stars";
import { RatingBadge } from "./RatingBadge";

type RatingData = {
  slug: string;
  score: number;
  count: number;
};

interface Props {
  slug: string;
}

export function SiteRating({ slug }: Props) {
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const controller = new AbortController();
    
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/ratings?slug=${slug}`, {
          signal: controller.signal
        });
        if (response.ok) {
          const data = await response.json();
          setRating(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error("Erro ao buscar avaliação:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRating();

    return () => {
      controller.abort();
    };
  }, [slug]);

  // Renderizar sempre o mesmo espaço para evitar CLS
  return (
    <div className="inline-flex items-center gap-2 text-sm site-rating">
      {!mounted || loading ? (
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      ) : !rating || rating.count === 0 ? (
        <span className="text-gray-500">Sem avaliações</span>
      ) : (
        <>
          <StarRatingDisplay value={rating.score} />
          <RatingBadge avg={rating.score} count={rating.count} />
        </>
      )}
    </div>
  );
}
