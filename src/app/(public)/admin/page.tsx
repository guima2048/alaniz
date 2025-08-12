"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";

const FIXED_USERNAME = "admin";
const FIXED_PASSWORD = "casal1010";
const SESSION_KEY = "admin.session";

type AuthState = { isLoggedIn: boolean };
type Stats = {
  sites: number;
  posts: number;
  categories: number;
  comments: number;
};

function loadAuthState(): AuthState {
  if (typeof window === "undefined") return { isLoggedIn: false };
  return { isLoggedIn: window.localStorage.getItem(SESSION_KEY) === "true" };
}

export default function AdminLoginPage() {
  const [{ isLoggedIn }, setState] = useState<AuthState>({ isLoggedIn: false });
  const [stats, setStats] = useState<Stats>({ sites: 0, posts: 0, categories: 0, comments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setState(loadAuthState());
  }, []);

  // Buscar estatísticas reais
  useEffect(() => {
    if (!isLoggedIn) return;

    async function fetchStats() {
      try {
        setLoading(true);
        
        // Buscar sites
        const sitesRes = await fetch('/api/sites', { cache: 'no-store' });
        const sites = sitesRes.ok ? await sitesRes.json() : [];
        
        // Buscar posts
        const postsRes = await fetch('/api/posts', { cache: 'no-store' });
        const posts = postsRes.ok ? await postsRes.json() : [];
        
        // Buscar categorias
        const categoriesRes = await fetch('/api/categories', { cache: 'no-store' });
        const categories = categoriesRes.ok ? await categoriesRes.json() : [];
        
        // Buscar comentários (contar todos)
        const commentsRes = await fetch('/api/comments', { cache: 'no-store' });
        const comments = commentsRes.ok ? await commentsRes.json() : [];
        
        setStats({
          sites: sites.length,
          posts: posts.length,
          categories: categories.length,
          comments: comments.length
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [isLoggedIn]);

  const handleLogin = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      window.localStorage.setItem(SESSION_KEY, "true");
      setState({ isLoggedIn: true });
    } else {
      alert("Usuário ou senha inválidos.");
    }
  }, []);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setState({ isLoggedIn: false });
  }, []);

  const content = useMemo(() => {
    if (!isLoggedIn) {
      return (
        <div className="max-w-sm mx-auto mt-16 p-6 border rounded-lg shadow-sm bg-white">
          <h1 className="text-xl font-semibold mb-4">Entrar no Admin</h1>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="username" className="text-sm">Usuário</label>
              <input id="username" name="username" className="border rounded px-3 py-2" required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm">Senha</label>
              <input id="password" name="password" type="password" className="border rounded px-3 py-2" required />
            </div>
            <button type="submit" className="w-full bg-black text-white rounded px-3 py-2">Entrar</button>
            <p className="text-xs text-gray-600">Usuário: admin · Senha: casal1010</p>
          </form>
        </div>
      );
    }
    
    return (
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <button 
            onClick={handleLogout} 
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Sair
          </button>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🌐</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Sites</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loading ? "..." : stats.sites}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Posts</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loading ? "..." : stats.posts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">🏷️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Categorias</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loading ? "..." : stats.categories}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-2xl">💬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-neutral-600">Comentários</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {loading ? "..." : stats.comments}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Links rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/admin/site" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🌐</span>
              <h3 className="text-lg font-semibold">Gerenciar Sites</h3>
            </div>
            <p className="text-neutral-600 text-sm">Adicione, edite ou remova sites de relacionamento da lista.</p>
          </Link>

          <Link 
            href="/admin/post" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📝</span>
              <h3 className="text-lg font-semibold">Gerenciar Posts</h3>
            </div>
            <p className="text-neutral-600 text-sm">Crie e edite posts do blog sobre relacionamentos.</p>
          </Link>

          <Link 
            href="/admin/categorias" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🏷️</span>
              <h3 className="text-lg font-semibold">Categorias</h3>
            </div>
            <p className="text-neutral-600 text-sm">Organize os sites em categorias específicas.</p>
          </Link>

          <Link 
            href="/admin/comentarios" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">💬</span>
              <h3 className="text-lg font-semibold">Moderação de Comentários</h3>
            </div>
            <p className="text-neutral-600 text-sm">Aprove, rejeite ou exclua comentários dos usuários.</p>
          </Link>

          <Link 
            href="/admin/sobre" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">ℹ️</span>
              <h3 className="text-lg font-semibold">Página Sobre</h3>
            </div>
            <p className="text-neutral-600 text-sm">Edite o conteúdo da página sobre o site.</p>
          </Link>

          <Link 
            href="/admin/relatorios" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">📊</span>
              <h3 className="text-lg font-semibold">Relatórios</h3>
            </div>
            <p className="text-neutral-600 text-sm">Atualize automaticamente imagens de todos os sites e gere relatórios.</p>
          </Link>

          <Link 
            href="/" 
            className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">👁️</span>
              <h3 className="text-lg font-semibold">Ver Site</h3>
            </div>
            <p className="text-neutral-600 text-sm">Visualize o site como os usuários veem.</p>
          </Link>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">⚙️</span>
              <h3 className="text-lg font-semibold">Configurações</h3>
            </div>
            <p className="text-neutral-600 text-sm">Configurações gerais do sistema (em breve).</p>
          </div>
        </div>
      </div>
    );
  }, [isLoggedIn, handleLogin, handleLogout, stats, loading]);

  return content;
}


