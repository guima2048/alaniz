"use client";
import { useState, useEffect } from "react";
import { StarRatingDisplay } from "./Stars";
import { RatingBadge } from "./RatingBadge";

type RatingData = {
  score: number;
  count: number;
};

type Props = {
  slug: string;
};

export function SiteRating({ slug }: Props) {
  const [rating, setRating] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await fetch(`/api/ratings?slug=${slug}`);
        if (response.ok) {
          const data = await response.json();
          setRating(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Erro ao buscar rating:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRating();
  }, [slug]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 text-sm site-rating">
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!rating || rating.count === 0) {
    return (
      <div className="inline-flex items-center gap-2 text-sm site-rating">
        <span className="text-gray-500">Sem avaliações</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-sm site-rating">
      <StarRatingDisplay value={rating.score} />
      <RatingBadge avg={rating.score} count={rating.count} />
    </div>
  );
}
