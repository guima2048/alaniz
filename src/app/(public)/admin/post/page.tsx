"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type PostItem = {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  cover?: string;
  published_at?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar");
  return (await res.json()) as T;
}

export default function AdminPostPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [covers, setCovers] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const selected = useMemo(() => posts.find((p) => p.slug === selectedSlug) || null, [posts, selectedSlug]);

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
        const [data, cov] = await Promise.all([
          fetchJson<PostItem[]>("/api/posts"),
          fetchJson<string[]>("/api/media/covers"),
        ]);
        setPosts(data);
        setCovers(cov);
        if (!selectedSlug && data.length) setSelectedSlug(data[0].slug);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [ok]);

  useEffect(() => {
    if (!selectedSlug && posts.length) setSelectedSlug(posts[0].slug);
  }, [posts, selectedSlug]);

  const updateSelected = (patch: Partial<PostItem>) => {
    setPosts((prev) => prev.map((it) => (it.slug === selectedSlug ? { ...it, ...patch } : it)));
    if (typeof patch.slug === "string") setSelectedSlug(patch.slug);
  };

  const addNewPost = () => {
    const base = "novo-post";
    let slug = base;
    const existing = new Set(posts.map((p) => p.slug));
    let i = 2;
    while (existing.has(slug)) slug = `${base}-${i++}`;
    const post: PostItem = { slug, title: "Novo post", excerpt: "", content: "" };
    setPosts((prev) => [...prev, post]);
    setSelectedSlug(slug);
  };

  const save = async () => {
    const post = posts.find((p) => p.slug === selectedSlug);
    if (!post) return;
    const res = await fetch("/api/posts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(post),
    });
    if (!res.ok) alert("Erro ao salvar");
  };

  const publishNow = () => {
    updateSelected({ published_at: new Date().toISOString() });
  };

  const remove = async () => {
    const post = posts.find((p) => p.slug === selectedSlug);
    if (!post) return;
    if (!confirm(`Excluir o post "${post.title}" (${post.slug})?`)) return;
    const res = await fetch(`/api/posts?slug=${encodeURIComponent(post.slug)}`, { method: "DELETE" });
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug));
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
          <span>Posts</span>
          <button type="button" className="text-sm px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700" onClick={addNewPost}>
            Adicionar post
          </button>
        </div>
        <ul className="max-h-[70vh] overflow-auto">
          {posts.map((p) => (
            <li key={p.slug}>
              <button
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${selectedSlug === p.slug ? "bg-gray-100 font-medium" : ""}`}
                onClick={() => setSelectedSlug(p.slug)}
              >
                {p.title}
                <div className="text-xs text-gray-500">{p.slug}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="border rounded bg-white p-4">
        {!selected ? (
          <div>Selecione um post na lista ao lado.</div>
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
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Capa</label>
                <select className="w-full border rounded px-3 py-2" value={selected.cover || ""} onChange={(e) => updateSelected({ cover: e.target.value || undefined })}>
                  <option value="">— selecionar —</option>
                  {covers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2">
                  {selected.cover ? <img src={selected.cover} alt="capa" className="h-20 object-contain" /> : null}
                  <form
                    onChange={async (e) => {
                      const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
                      if (!input || !input.files || !input.files[0]) return;
                      const fd = new FormData();
                      fd.append("file", input.files[0]);
                      const res = await fetch("/api/media/covers", { method: "POST", body: fd });
                      if (res.ok) {
                        const { path } = await res.json();
                        setCovers((prev) => Array.from(new Set([...prev, path])));
                        updateSelected({ cover: path });
                      } else {
                        alert("Falha no upload da capa");
                      }
                      (input as HTMLInputElement).value = "";
                    }}
                  >
                    <input type="file" name="file" accept="image/*" className="text-sm" />
                  </form>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Resumo (excerpt)</label>
              <textarea className="w-full border rounded px-3 py-2 min-h-24" value={selected.excerpt || ""} onChange={(e) => updateSelected({ excerpt: e.target.value || undefined })} />
            </div>

            <div>
              <label className="block text-sm mb-1">Conteúdo</label>
              <textarea className="w-full border rounded px-3 py-2 min-h-48" value={selected.content || ""} onChange={(e) => updateSelected({ content: e.target.value || undefined })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Publicado em</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2"
                  value={selected.published_at ? new Date(selected.published_at).toISOString().slice(0,16) : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateSelected({ published_at: v ? new Date(v).toISOString() : undefined });
                  }}
                />
              </div>
              <div className="flex items-end">
                <button onClick={publishNow} className="px-3 py-2 rounded bg-blue-600 text-white">Publicar agora</button>
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
