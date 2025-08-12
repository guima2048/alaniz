"use client";
import { useState } from "react";
import { Stars } from "./Stars";
import { sendGA4Event } from "@/lib/gtm";

interface Props {
  slug: string;
}

export function RateForm({ slug }: Props) {
  const [score, setScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, score }),
      });

      if (res.ok) {
        setSubmitted(true);
        
        // Enviar evento para GA4
        sendGA4Event('rating_submitted', {
          site_slug: slug,
          rating_score: score,
          rating_count: 1
        });
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-sm text-neutral-600">
        ✅ Obrigado pela sua avaliação!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-600">Avalie:</span>
        <Stars score={score} onScoreChange={setScore} />
      </div>
      {score > 0 && (
        <button
          type="submit"
          disabled={loading}
          className="text-xs bg-neutral-900 text-white px-3 py-1 rounded hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      )}
    </form>
  );
}


