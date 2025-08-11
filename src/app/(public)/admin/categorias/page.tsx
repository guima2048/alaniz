"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { slug: string; title: string; order?: number };

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar");
  return (await res.json()) as T;
}

export default function AdminCategoriasPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const selected = useMemo(() => cats.find((c) => c.slug === selectedSlug) || null, [cats, selectedSlug]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLoggedIn = window.localStorage.getItem("admin.session") === "true";
    if (!isLoggedIn) router.replace("/admin"); else setOk(true);
  }, [router]);

  useEffect(() => {
    if (!ok) return;
    (async () => {
      try {
        const list = await fetchJson<Category[]>("/api/categories");
        setCats(list);
        if (!selectedSlug && list.length) setSelectedSlug(list[0].slug);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [ok, selectedSlug]);

  useEffect(() => {
    if (!selectedSlug && cats.length) setSelectedSlug(cats[0].slug);
  }, [cats, selectedSlug]);

  const updateSelected = (patch: Partial<Category>) => {
    setCats((prev) => prev.map((it) => (it.slug === selectedSlug ? { ...it, ...patch } : it)));
    if (typeof patch.slug === "string") setSelectedSlug(patch.slug);
  };

  const addNew = () => {
    const base = "nova-categoria";
    let slug = base;
    const existing = new Set(cats.map((c) => c.slug));
    let i = 2;
    while (existing.has(slug)) slug = `${base}-${i++}`;
    
    // Definir a ordem como a próxima disponível
    const maxOrder = Math.max(...cats.map(c => c.order || 0), 0);
    const cat: Category = { 
      slug, 
      title: "Nova categoria",
      order: maxOrder + 1
    };
    setCats((prev) => [...prev, cat]);
    setSelectedSlug(slug);
  };

  const save = async () => {
    const cat = cats.find((c) => c.slug === selectedSlug);
    if (!cat) return;
    const res = await fetch("/api/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cat),
    });
    if (res.ok) {
      // Recarregar a lista de categorias após salvar
      try {
        const list = await fetchJson<Category[]>("/api/categories");
        setCats(list);
        alert("Categoria salva com sucesso!");
      } catch (e) {
        console.error("Erro ao recarregar categorias:", e);
      }
    } else {
      alert("Erro ao salvar");
    }
  };

  const remove = async () => {
    const cat = cats.find((c) => c.slug === selectedSlug);
    if (!cat) return;
    if (!confirm(`Excluir a categoria "${cat.title}" (${cat.slug})?`)) return;
    const res = await fetch(`/api/categories?slug=${encodeURIComponent(cat.slug)}`, { method: "DELETE" });
    if (res.ok) {
      setCats((prev) => prev.filter((c) => c.slug !== cat.slug));
      setSelectedSlug("");
    } else {
      alert("Falha ao excluir");
    }
  };

  if (!ok) return null;

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      <aside className="border rounded bg-white">
        <div className="p-3 border-b font-medium flex items-center justify-between">
          <span>Categorias</span>
          <div className="flex gap-2">
            <button 
              type="button" 
              className="text-sm px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => router.push("/admin/categorias/ordem")}
            >
              Gerenciar Ordem
            </button>
            <button type="button" className="text-sm px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={addNew}>
              Adicionar categoria
            </button>
          </div>
        </div>
        <ul className="max-h-[70vh] overflow-auto">
          {cats.map((c) => (
            <li key={c.slug} className="flex items-center">
              <button
                className={`flex-1 text-left px-3 py-2 hover:bg-gray-50 ${selectedSlug === c.slug ? "bg-gray-100 font-medium" : ""}`}
                onClick={() => setSelectedSlug(c.slug)}
              >
                {c.title}
                <div className="text-xs text-gray-500">{c.slug}</div>
              </button>
              <button
                className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 mr-2"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(`Excluir a categoria "${c.title}" (${c.slug})?`)) return;
                  const res = await fetch(`/api/categories?slug=${encodeURIComponent(c.slug)}`, { method: "DELETE" });
                  if (res.ok) {
                    setCats((prev) => prev.filter((cat) => cat.slug !== c.slug));
                    if (selectedSlug === c.slug) {
                      setSelectedSlug("");
                    }
                  } else {
                    alert("Falha ao excluir categoria");
                  }
                }}
                title={`Excluir ${c.title}`}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="border rounded bg-white p-4">
        {!selected ? (
          <div>Selecione uma categoria na lista ao lado.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Título</label>
                <input className="w-full border rounded px-3 py-2" value={selected.title} onChange={(e) => updateSelected({ title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Slug</label>
                <input className="w-full border rounded px-3 py-2" value={selected.slug} onChange={(e) => updateSelected({ slug: e.target.value.trim() })} />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={save} className="px-4 py-2 rounded bg-black text-white">Salvar</button>
              <button onClick={remove} className="px-4 py-2 rounded bg-red-600 text-white">Excluir</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}


