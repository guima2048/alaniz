"use client";

import { useEffect, useState } from "react";
import { StarRatingDisplay, StarSelector } from "./Stars";

type Props = { slug: string };

type RatingData = { score: number; count: number };

export function RateForm({ slug }: Props) {
  const [data, setData] = useState<RatingData>({ score: 0, count: 0 });
  // seletor trabalha em 1..5; converteremos para 0..10 ao enviar
  const [stars, setStars] = useState<number>(5);
  const [sending, setSending] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/ratings?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    void load();
  }, [slug, load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setOk(null);
    setErr(null);
    try {
      const res = await fetch(`/${encodeURIComponent(slug)}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: stars * 2 }),
      });
      if (!res.ok) throw new Error("Falha ao enviar");
      setOk("Obrigado pelo seu voto!");
      await load();
    } catch {
      setErr("Não foi possível registrar seu voto.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-white/60 rounded border border-neutral-200 p-3">
      <div className="flex items-center gap-2 text-sm text-neutral-700">
        <span className="font-medium">Nota dos usuários:</span>
        <StarRatingDisplay value={Number(data.score || 0)} />
        <span className="ml-1">({Number(data.score || 0).toFixed(2)} / 10)</span>
        <span>· {data.count ?? 0} votos</span>
      </div>
      <form onSubmit={submit} className="flex items-center gap-3 text-sm">
        <span>Sua avaliação:</span>
        <StarSelector value={stars} onChange={setStars} />
        <button
          disabled={sending}
          className="px-3 py-1 rounded bg-neutral-900 text-white disabled:opacity-60"
          type="submit"
        >
          {sending ? "Enviando…" : "Avaliar"}
        </button>
        {ok && <span className="text-emerald-700">{ok}</span>}
        {err && <span className="text-red-600">{err}</span>}
      </form>
    </div>
  );
}


