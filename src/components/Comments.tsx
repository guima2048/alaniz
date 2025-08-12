"use client";
import { useEffect, useState } from "react";
import { formatDateSP } from "@/lib/date";

type CommentItem = {
  id: string;
  slug: string;
  name: string;
  message: string;
  created_at: string;
  status?: 'pending' | 'approved' | 'rejected';
};

export function Comments({ slug }: { slug: string }) {
  const [items, setItems] = useState<CommentItem[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, { cache: "no-store" });
        if (res.ok) {
          setItems(await res.json());
        }
      } catch {}
    })();
  }, [slug]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name: name.trim(), message: message.trim() }),
      });
      if (res.ok) {
        setSubmitted(true);
        setMessage("");
        setName("");
        // Recarregar comentários após alguns segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Comentários</h2>
      
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 text-sm">
            ✅ Seu comentário foi enviado e está aguardando moderação. Ele aparecerá aqui assim que for aprovado.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded px-3 py-2"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />
        </div>
        <textarea
          className="w-full border rounded px-3 py-2"
          placeholder="Escreva seu comentário"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          required
        />
        <div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded bg-neutral-900 text-white px-3 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? "Enviando..." : "Enviar comentário"}
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {items.map((c) => (
          <li key={c.id} className="border rounded p-3 bg-white">
            <div className="text-sm text-neutral-600">
              <span className="font-medium">{c.name}</span>
              <span> · {formatDateSP(c.created_at)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap">{c.message}</p>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-sm text-neutral-600">Seja o primeiro a comentar.</li>
        )}
      </ul>
    </section>
  );
}


