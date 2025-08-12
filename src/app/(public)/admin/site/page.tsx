"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SiteItem = {
  slug: string;
  name: string;
  url: string;
  logo?: string;
  cover?: string;
  short_desc?: string;
  categories?: string[];
  price_min?: number;
  price_model?: string;
  style?: string;
  audience?: string;
  privacy_level?: string;
  editorial_score?: number;
  rating_avg?: number;
  rating_count?: number;
  features?: string[];
  hero?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar");
  return (await res.json()) as T;
}

export default function SiteEditorPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = window.localStorage.getItem("admin.session") === "true";
    if (!ok) router.replace("/admin");
    else setIsAuthorized(true);
  }, [router]);

  const [sites, setSites] = useState<SiteItem[]>([]);
  const [logos, setLogos] = useState<string[]>([]);
  const [covers, setCovers] = useState<string[]>([]);
  const [heroes, setHeroes] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ slug: string; title: string }[]>([]);
  const [ratingScore, setRatingScore] = useState<number | "">("");
  const [ratingCount, setRatingCount] = useState<number | "">("");
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const selected = useMemo(() => sites.find((s) => s.slug === selectedSlug) || null, [sites, selectedSlug]);

  // Carrega dados iniciais uma vez (ou quando autenticação ficar ok)
  useEffect(() => {
    if (!isAuthorized) return;
    (async () => {
      try {
        const [s, l, c, cats, h] = await Promise.all([
          fetchJson<SiteItem[]>("/api/sites"),
          fetchJson<string[]>("/api/media/logos"),
          fetchJson<string[]>("/api/media/covers"),
          fetchJson<{ slug: string; title: string }[]>("/api/categories"),
          fetchJson<string[]>("/api/media/heroes"),
        ]);
        setSites(s);
        setLogos(l);
        setCovers(c);
        setCategories(cats);
        setHeroes(h);
        if (!selectedSlug && s.length) setSelectedSlug(s[0].slug);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isAuthorized, selectedSlug]);

  // Se não houver seleção, seleciona o primeiro da lista sempre que a lista atualizar
  useEffect(() => {
    if (!selectedSlug && sites.length) setSelectedSlug(sites[0].slug);
  }, [sites, selectedSlug]);

  // Carrega rating do site selecionado
  useEffect(() => {
    if (!isAuthorized || !selectedSlug) return;
    (async () => {
      try {
        const r = await fetchJson<{ score: number; count: number }>(`/api/ratings?slug=${encodeURIComponent(selectedSlug)}`);
        setRatingScore(typeof r.score === "number" ? r.score : 0);
        setRatingCount(typeof r.count === "number" ? r.count : 0);
      } catch {
        setRatingScore(0);
        setRatingCount(0);
      }
    })();
  }, [selectedSlug, isAuthorized]);

  const updateSelected = (patch: Partial<SiteItem>) => {
    // Se está mudando o slug, verificar se já existe (apenas se for diferente)
    if (typeof patch.slug === "string" && patch.slug !== selectedSlug && patch.slug.trim() !== "") {
      const existingSlugs = new Set(sites.map(s => s.slug));
      if (existingSlugs.has(patch.slug)) {
        alert(`O slug "${patch.slug}" já existe. Escolha outro nome.`);
        return;
      }
    }
    
    setSites((prev) => prev.map((it) => (it.slug === selectedSlug ? { ...it, ...patch } : it)));
    if (typeof patch.slug === "string") setSelectedSlug(patch.slug);
  };

  const addNewSite = () => {
    const base = "novo-site";
    let slug = base;
    const existing = new Set(sites.map((s) => s.slug));
    let i = 2;
    while (existing.has(slug)) {
      slug = `${base}-${i++}`;
    }
    const newSite: SiteItem = { slug, name: "Novo site", url: "" };
    setSites((prev) => [...prev, newSite]);
    setSelectedSlug(slug);
  };

  const save = async () => {
    const site = sites.find((s) => s.slug === selectedSlug);
    if (!site) return;
    const res = await fetch("/api/sites", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(site),
    });
    if (!res.ok) alert("Erro ao salvar");
  };

  const saveRating = async () => {
    const site = sites.find((s) => s.slug === selectedSlug);
    if (!site) return;
    if (ratingScore === "" || ratingCount === "") return alert("Preencha nota e número de votos");
    await fetch("/api/ratings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: site.slug, score: Number(ratingScore), count: Number(ratingCount) }),
    });
  };

  const remove = async () => {
    const site = sites.find((s) => s.slug === selectedSlug);
    if (!site) return;
    if (!confirm(`Excluir o site "${site.name}" (${site.slug})?`)) return;
    const res = await fetch(`/api/sites?slug=${encodeURIComponent(site.slug)}`, { method: "DELETE" });
    if (res.ok) {
      setSites((prev) => prev.filter((s) => s.slug !== site.slug));
      setSelectedSlug("");
    } else {
      alert("Falha ao excluir");
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
      <aside className="border rounded bg-white">
        <div className="p-3 border-b font-medium flex items-center justify-between">
          <span>Sites</span>
          <button
            type="button"
            className="text-sm px-2 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={addNewSite}
          >
            Adicionar site
          </button>
        </div>
        <ul className="max-h-[70vh] overflow-auto">
          {sites.map((s) => (
            <li key={s.slug} className="flex items-center">
              <button
                className={`flex-1 text-left px-3 py-2 hover:bg-gray-50 ${selectedSlug === s.slug ? "bg-gray-100 font-medium" : ""}`}
                onClick={() => setSelectedSlug(s.slug)}
              >
                {s.name}
                <div className="text-xs text-gray-500">{s.slug}</div>
              </button>
              <button
                className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 mr-2"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!confirm(`Excluir o site "${s.name}" (${s.slug})?`)) return;
                  const res = await fetch(`/api/sites?slug=${encodeURIComponent(s.slug)}`, { method: "DELETE" });
                  if (res.ok) {
                    setSites((prev) => prev.filter((site) => site.slug !== s.slug));
                    if (selectedSlug === s.slug) {
                      setSelectedSlug("");
                    }
                  } else {
                    alert("Falha ao excluir site");
                  }
                }}
                title={`Excluir ${s.name}`}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="border rounded bg-white p-4">
        {!selected ? (
          <div>Selecione um site na lista ao lado.</div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">📱 Formatos de Imagem para Celular:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li><strong>Logo:</strong> PNG, JPG, SVG - até 2MB - recomendado: quadrado 120x120px</li>
                <li><strong>Capa:</strong> PNG, JPG - até 5MB - recomendado: 800x420px (proporção 1.9:1)</li>
                <li><strong>Hero:</strong> PNG, JPG - até 5MB - recomendado: 800x213px (proporção 3.75:1)</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">💻 Dimensões para Desktop (opcional):</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li><strong>Logo:</strong> 200x200px (quadrado)</li>
                  <li><strong>Capa:</strong> 1200x630px (proporção 1.9:1)</li>
                  <li><strong>Hero:</strong> 1200x320px (proporção 3.75:1)</li>
                </ul>
                <p className="text-xs text-blue-700 mt-2">
                  💡 <strong>Dica:</strong> Use as dimensões para celular para melhor performance e carregamento mais rápido em dispositivos móveis!
                </p>
              </div>
              {selected.url && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <button
                    type="button"
                    className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    onClick={async () => {
                      if (!selected.url) {
                        alert("Adicione a URL do site primeiro");
                        return;
                      }
                      try {
                        const types = ['logos', 'covers', 'heroes'];
                        let successCount = 0;
                        
                        for (const type of types) {
                          try {
                            const res = await fetch("/api/media/fetch-and-save", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                url: selected.url,
                                type,
                                slug: selected.slug
                              })
                            });
                            if (res.ok) {
                              const { path } = await res.json();
                              if (type === 'logos') {
                                setLogos((prev) => Array.from(new Set([...prev, path])));
                                updateSelected({ logo: path });
                              } else if (type === 'covers') {
                                setCovers((prev) => Array.from(new Set([...prev, path])));
                                updateSelected({ cover: path });
                              } else if (type === 'heroes') {
                                setHeroes((prev) => Array.from(new Set([...prev, path])));
                                updateSelected({ hero: path });
                              }
                              successCount++;
                            }
                          } catch {
                            console.error(`Erro ao buscar ${type}`);
                          }
                        }
                        
                        if (successCount > 0) {
                          alert(`✅ ${successCount} imagem(ns) buscada(s) automaticamente!`);
                        } else {
                          alert("❌ Não foi possível buscar imagens automaticamente");
                        }
                      } catch {
                        alert("Falha ao buscar imagens automaticamente");
                      }
                    }}
                  >
                    🚀 Buscar Todas as Imagens Automaticamente
                  </button>
                  <p className="text-xs text-blue-700 mt-1">
                    Busca logo, capa e hero do site automaticamente usando meta tags
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Nome</label>
                <input className="w-full border rounded px-3 py-2" value={selected.name}
                  onChange={(e) => updateSelected({ name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm mb-1">Slug</label>
                <input 
                  className="w-full border rounded px-3 py-2" 
                  value={selected.slug}
                  onChange={(e) => {
                    e.preventDefault();
                    const newSlug = e.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9-]/g, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-|-$/g, '');
                    updateSelected({ slug: newSlug });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Apenas letras, números e hífens. Será convertido automaticamente.
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">URL</label>
                <input className="w-full border rounded px-3 py-2" value={selected.url}
                  onChange={(e) => updateSelected({ url: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Logo (home) - PNG, JPG, SVG até 2MB - 120x120px</label>
                <select className="w-full border rounded px-3 py-2" value={selected.logo || ""}
                  onChange={(e) => updateSelected({ logo: e.target.value || undefined })}>
                  <option value="">— selecionar —</option>
                  {logos.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {selected.logo ? <img src={selected.logo} alt="logo" className="h-10" /> : null}
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    onChange={async (e) => {
                      const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
                      if (!input || !input.files || !input.files[0]) return;
                      const fd = new FormData();
                      fd.append("file", input.files[0]);
                      const res = await fetch("/api/media/logos", { method: "POST", body: fd });
                      if (res.ok) {
                        const { path } = await res.json();
                        setLogos((prev) => Array.from(new Set([...prev, path])));
                        updateSelected({ logo: path });
                      } else {
                        alert("Falha no upload do logo");
                      }
                      // reset input
                      input.value = "";
                    }}
                  >
                    <input type="file" name="file" accept="image/*" className="text-sm" />
                  </form>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={async () => {
                      if (!selected.url) {
                        alert("Adicione a URL do site primeiro");
                        return;
                      }
                      try {
                        const res = await fetch("/api/media/fetch-and-save", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            url: selected.url,
                            type: "logos",
                            slug: selected.slug
                          })
                        });
                        if (res.ok) {
                          const { path } = await res.json();
                          setLogos((prev) => Array.from(new Set([...prev, path])));
                          updateSelected({ logo: path });
                          alert("Logo buscado automaticamente!");
                        } else {
                          const error = await res.json();
                          alert(`Erro: ${error.error}`);
                        }
                      } catch {
                        alert("Falha ao buscar logo automaticamente");
                      }
                    }}
                  >
                    🔍 Buscar
                  </button>
                  {selected.logo ? (
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                      onClick={async () => {
                        if (!confirm("Excluir este logo?")) return;
                        const res = await fetch(`/api/media/logos?path=${encodeURIComponent(selected.logo!)}`, { method: "DELETE" });
                        if (res.ok) {
                          setLogos((prev) => prev.filter((p) => p !== selected.logo));
                          updateSelected({ logo: undefined });
                        } else {
                          alert("Falha ao excluir logo");
                        }
                      }}
                    >
                      Excluir logo
                    </button>
                  ) : null}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Capa (home) - PNG, JPG até 5MB, 800x420px</label>
                <select className="w-full border rounded px-3 py-2" value={selected.cover || ""}
                  onChange={(e) => updateSelected({ cover: e.target.value || undefined })}>
                  <option value="">— selecionar —</option>
                  {covers.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {selected.cover ? <img src={selected.cover} alt="capa" className="h-20 object-contain" /> : null}
                  <form
                    onSubmit={(e) => e.preventDefault()}
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
                      input.value = "";
                    }}
                  >
                    <input type="file" name="file" accept="image/*" className="text-sm" />
                  </form>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={async () => {
                      if (!selected.url) {
                        alert("Adicione a URL do site primeiro");
                        return;
                      }
                      try {
                        const res = await fetch("/api/media/fetch-and-save", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            url: selected.url,
                            type: "covers",
                            slug: selected.slug
                          })
                        });
                        if (res.ok) {
                          const { path } = await res.json();
                          setCovers((prev) => Array.from(new Set([...prev, path])));
                          updateSelected({ cover: path });
                          alert("Capa buscada automaticamente!");
                        } else {
                          const error = await res.json();
                          alert(`Erro: ${error.error}`);
                        }
                      } catch {
                        alert("Falha ao buscar capa automaticamente");
                      }
                    }}
                  >
                    🔍 Buscar
                  </button>
                  {selected.cover ? (
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                      onClick={async () => {
                        if (!confirm("Excluir esta capa?")) return;
                        const res = await fetch(`/api/media/covers?path=${encodeURIComponent(selected.cover!)}`, { method: "DELETE" });
                        if (res.ok) {
                          setCovers((prev) => prev.filter((p) => p !== selected.cover));
                          updateSelected({ cover: undefined });
                        } else {
                          alert("Falha ao excluir capa");
                        }
                      }}
                    >
                      Excluir capa
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">HERO (na página do site) - PNG, JPG até 5MB, 800x213px</label>
                <select className="w-full border rounded px-3 py-2" value={selected.hero || ""}
                  onChange={(e) => updateSelected({ hero: e.target.value || undefined })}>
                  <option value="">— selecionar —</option>
                  {heroes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 mt-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {selected.hero ? <img src={selected.hero} alt="hero" className="h-28 object-cover" /> : null}
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    onChange={async (e) => {
                      const input = e.currentTarget.elements.namedItem("file") as HTMLInputElement | null;
                      if (!input || !input.files || !input.files[0]) return;
                      const fd = new FormData();
                      fd.append("file", input.files[0]);
                      const res = await fetch("/api/media/heroes", { method: "POST", body: fd });
                      if (res.ok) {
                        const { path } = await res.json();
                        setHeroes((prev) => Array.from(new Set([...prev, path])));
                        updateSelected({ hero: path });
                      } else {
                        alert("Falha no upload do HERO");
                      }
                      input.value = "";
                    }}
                  >
                    <input type="file" name="file" accept="image/*" className="text-sm" />
                  </form>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={async () => {
                      if (!selected.url) {
                        alert("Adicione a URL do site primeiro");
                        return;
                      }
                      try {
                        const res = await fetch("/api/media/fetch-and-save", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            url: selected.url,
                            type: "heroes",
                            slug: selected.slug
                          })
                        });
                        if (res.ok) {
                          const { path } = await res.json();
                          setHeroes((prev) => Array.from(new Set([...prev, path])));
                          updateSelected({ hero: path });
                          alert("Hero buscado automaticamente!");
                        } else {
                          const error = await res.json();
                          alert(`Erro: ${error.error}`);
                        }
                      } catch {
                        alert("Falha ao buscar hero automaticamente");
                      }
                    }}
                  >
                    🔍 Buscar
                  </button>
                  {selected.hero ? (
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white"
                      onClick={async () => {
                        if (!confirm("Excluir este HERO?")) return;
                        const res = await fetch(`/api/media/heroes?path=${encodeURIComponent(selected.hero!)}`, { method: "DELETE" });
                        if (res.ok) {
                          setHeroes((prev) => prev.filter((p) => p !== selected.hero));
                          updateSelected({ hero: undefined });
                        } else {
                          alert("Falha ao excluir HERO");
                        }
                      }}
                    >
                      Excluir HERO
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Texto (resumo na home)</label>
              <textarea className="w-full border rounded px-3 py-2 min-h-28"
                value={selected.short_desc || ""}
                onChange={(e) => updateSelected({ short_desc: e.target.value || undefined })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Categorias</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const active = (selected.categories || []).includes(cat.slug);
                    return (
                      <button
                        key={cat.slug}
                        type="button"
                        className={`px-2 py-1 rounded border text-sm ${active ? "bg-black text-white" : "bg-white"}`}
                        onClick={() => {
                          const cur = new Set(selected.categories || []);
                          if (cur.has(cat.slug)) cur.delete(cat.slug); else cur.add(cat.slug);
                          updateSelected({ categories: Array.from(cur) });
                        }}
                      >
                        {cat.title}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm mb-1">Preço mínimo</label>
                  <input type="number" step="0.01" className="w-full border rounded px-3 py-2"
                    value={selected.price_min ?? ""}
                    onChange={(e) => updateSelected({ price_min: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Modelo de preço</label>
                  <input className="w-full border rounded px-3 py-2"
                    value={selected.price_model ?? ""}
                    onChange={(e) => updateSelected({ price_model: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <label className="block textsm mb-1">Estilo</label>
                  <input className="w-full border rounded px-3 py-2"
                    value={selected.style ?? ""}
                    onChange={(e) => updateSelected({ style: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Público</label>
                  <input className="w-full border rounded px-3 py-2"
                    value={selected.audience ?? ""}
                    onChange={(e) => updateSelected({ audience: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Privacidade</label>
                  <input className="w-full border rounded px-3 py-2"
                    value={selected.privacy_level ?? ""}
                    onChange={(e) => updateSelected({ privacy_level: e.target.value || undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Nota editorial</label>
                  <input type="number" step="0.1" className="w-full border rounded px-3 py-2"
                    value={selected.editorial_score ?? ""}
                    onChange={(e) => updateSelected({ editorial_score: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Rating médio</label>
                  <input type="number" step="0.1" className="w-full border rounded px-3 py-2"
                    value={selected.rating_avg ?? ""}
                    onChange={(e) => updateSelected({ rating_avg: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Nº avaliações</label>
                  <input type="number" className="w-full border rounded px-3 py-2"
                    value={selected.rating_count ?? ""}
                    onChange={(e) => updateSelected({ rating_count: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Recursos (features)</label>
              <input className="w-full border rounded px-3 py-2"
                placeholder="separe por vírgula"
                value={(selected.features || []).join(", ")}
                onChange={(e) => updateSelected({ features: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={save} className="px-4 py-2 rounded bg-black text-white">Salvar</button>
              <button onClick={saveRating} className="px-4 py-2 rounded bg-emerald-600 text-white">Definir nota</button>
              <button onClick={remove} className="px-4 py-2 rounded bg-red-600 text-white">Excluir</button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-sm mb-1">Nota média (0-10)</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={10}
                  className="w-full border rounded px-3 py-2"
                  value={ratingScore}
                  onChange={(e) => setRatingScore(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Número de votos</label>
                <input
                  type="number"
                  min={0}
                  className="w-full border rounded px-3 py-2"
                  value={ratingCount}
                  onChange={(e) => setRatingCount(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="md:col-span-2">
                <button onClick={saveRating} className="px-4 py-2 rounded bg-emerald-600 text-white">Salvar avaliação</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
