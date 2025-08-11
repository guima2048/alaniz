"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Category = { 
  slug: string; 
  title: string; 
  order?: number;
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Falha ao carregar");
  return (await res.json()) as T;
}

export default function AdminCategoriasOrdemPage() {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isLoggedIn = window.localStorage.getItem("admin.session") === "true";
    if (!isLoggedIn) router.replace("/admin"); else setOk(true);
  }, [router]);

  useEffect(() => {
    if (!ok) return;
    loadCategories();
  }, [ok]);

  const loadCategories = async () => {
    try {
      const list = await fetchJson<Category[]>("/api/categories");
      // Garantir que todas as categorias tenham um order
      const sortedList = list.map((cat, index) => ({
        ...cat,
        order: cat.order ?? index + 1
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
      setCategories(sortedList);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setIsDragging(true);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newCategories = [...categories];
    const draggedItem = newCategories[draggedIndex];
    
    // Remover o item arrastado
    newCategories.splice(draggedIndex, 1);
    
    // Inserir na nova posição
    newCategories.splice(dropIndex, 0, draggedItem);
    
    // Atualizar a ordem
    const updatedCategories = newCategories.map((cat, index) => ({
      ...cat,
      order: index + 1
    }));
    
    setCategories(updatedCategories);
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedIndex(null);
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: categories.map((cat, index) => ({
            slug: cat.slug,
            order: index + 1
          }))
        })
      });
      
      if (res.ok) {
        alert("Ordem das categorias salva com sucesso!");
        await loadCategories(); // Recarregar para confirmar
      } else {
        alert("Erro ao salvar a ordem das categorias");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar a ordem das categorias");
    } finally {
      setSaving(false);
    }
  };

  const resetOrder = async () => {
    if (!confirm("Deseja resetar a ordem das categorias para a ordem padrão?")) return;
    await loadCategories();
  };

  if (!ok) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Gerenciar Ordem das Categorias</h1>
          <p className="text-gray-600">
            Arraste e solte as categorias para reordená-las. A ordem definida aqui será refletida na página inicial.
          </p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Ordem das Categorias</h2>
              <div className="flex gap-2">
                <button
                  onClick={resetOrder}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Resetar Ordem
                </button>
                <button
                  onClick={saveOrder}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Salvar Ordem"}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma categoria encontrada
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div
                    key={category.slug}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`
                      flex items-center gap-4 p-4 border rounded-lg cursor-move
                      ${isDragging && draggedIndex === index ? 'opacity-50 bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}
                      ${isDragging && draggedIndex !== index ? 'hover:bg-blue-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium">{category.title}</div>
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-400">
                        Ordem: {category.order || index + 1}
                      </div>
                      <div className="text-gray-300">⋮⋮</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preview da ordem */}
        <div className="mt-8 bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Preview da Ordem na Página Inicial</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {categories.map((category, index) => (
                <div key={category.slug} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{category.title}</div>
                    <div className="text-sm text-gray-500">
                      {category.slug === 'todos' ? 'Todos os sites' : `${category.title} - Sites desta categoria`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/admin/categorias")}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            ← Voltar para Gerenciar Categorias
          </button>
        </div>
      </div>
    </div>
  );
}
