"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AboutContent = {
  title: string;
  paragraphs: string[];
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar");
  return (await res.json()) as T;
}

export default function AdminSobrePage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [data, setData] = useState<AboutContent>({ title: "Sobre", paragraphs: [""] });
  const [saving, setSaving] = useState(false);

  // auth guard
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLoggedIn = window.localStorage.getItem("admin.session") === "true";
    if (!isLoggedIn) router.replace("/admin"); else setOk(true);
  }, [router]);

  useEffect(() => {
    if (!ok) return;
    (async () => {
      try {
        const content = await fetchJson<AboutContent>("/api/about");
        setData(content);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [ok]);

  const updateParagraph = (index: number, value: string) => {
    setData((prev) => {
      const next = [...prev.paragraphs];
      next[index] = value;
      return { ...prev, paragraphs: next };
    });
  };

  const addParagraph = () => {
    setData((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ""] }));
  };

  const removeParagraph = (index: number) => {
    setData((prev) => ({ ...prev, paragraphs: prev.paragraphs.filter((_, i) => i !== index) }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Falha ao salvar");
      alert("Salvo com sucesso");
    } catch {
      alert("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (!ok) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Editar página &quot;Sobre&quot;</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm mb-1">Título</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm">Parágrafos</label>
            <button onClick={addParagraph} className="px-3 py-1 text-sm rounded bg-gray-100 hover:bg-gray-200">
              Adicionar parágrafo
            </button>
          </div>
          {data.paragraphs.map((p, i) => (
            <div key={i} className="flex gap-2 items-start">
              <textarea
                className="w-full border rounded px-3 py-2 min-h-24"
                value={p}
                onChange={(e) => updateParagraph(i, e.target.value)}
              />
              <button onClick={() => removeParagraph(i)} className="px-3 py-2 text-sm rounded bg-red-50 text-red-700 hover:bg-red-100">
                Remover
              </button>
            </div>
          ))}
        </div>

        <div>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-black text-white disabled:opacity-60">
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
