"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDateSP } from "@/lib/date";

type CommentItem = {
  id: string;
  slug: string;
  name: string;
  message: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
};

type SiteItem = {
  slug: string;
  name: string;
};

export default function CommentsModerationPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ok = window.localStorage.getItem("admin.session") === "true";
    if (!ok) router.replace("/admin");
    else setIsAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    
    async function loadData() {
      try {
        setLoading(true);
        
        // Buscar comentários (todos, incluindo pendentes)
        const commentsRes = await fetch('/api/comments?admin=true', { cache: 'no-store' });
        const allComments = commentsRes.ok ? await commentsRes.json() : [];
        
        // Buscar sites para mostrar nomes
        const sitesRes = await fetch('/api/sites', { cache: 'no-store' });
        const allSites = sitesRes.ok ? await sitesRes.json() : [];
        
        setComments(allComments);
        setSites(allSites);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthorized]);

  const filteredComments = comments.filter(c => {
    if (filter === 'all') return true;
    return c.status === filter;
  });

  const getSiteName = (slug: string) => {
    const site = sites.find(s => s.slug === slug);
    return site?.name || slug;
  };

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      
      if (res.ok) {
        setComments(prev => prev.map(c => 
          c.id === id ? { ...c, status } : c
        ));
      }
    } catch (error) {
      console.error('Erro ao moderar comentário:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;
    
    try {
      const res = await fetch(`/api/comments?id=${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        setComments(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      pending: 'Pendente',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!isAuthorized) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Moderação de Comentários</h1>
        <button 
          onClick={() => router.push('/admin')}
          className="px-4 py-2 text-sm rounded bg-neutral-600 text-white hover:bg-neutral-700 transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              filter === 'all' 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
            }`}
          >
            Todos ({comments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              filter === 'pending' 
                ? 'bg-yellow-600 text-white border-yellow-600' 
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
            }`}
          >
            Pendentes ({comments.filter(c => c.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              filter === 'approved' 
                ? 'bg-green-600 text-white border-green-600' 
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
            }`}
          >
            Aprovados ({comments.filter(c => c.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              filter === 'rejected' 
                ? 'bg-red-600 text-white border-red-600' 
                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
            }`}
          >
            Rejeitados ({comments.filter(c => c.status === 'rejected').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-neutral-600">Carregando comentários...</p>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-neutral-600">
            {filter === 'pending' ? 'Nenhum comentário pendente.' :
             filter === 'approved' ? 'Nenhum comentário aprovado.' :
             filter === 'rejected' ? 'Nenhum comentário rejeitado.' :
             'Nenhum comentário encontrado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-neutral-900">{comment.name}</span>
                    <span className="text-sm text-neutral-500">•</span>
                    <span className="text-sm text-neutral-500">{formatDateSP(comment.createdAt)}</span>
                    <span className="text-sm text-neutral-500">•</span>
                    <span className="text-sm text-neutral-600">
                      Site: {getSiteName(comment.slug)}
                    </span>
                  </div>
                  {getStatusBadge(comment.status)}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-neutral-800 whitespace-pre-wrap">{comment.message}</p>
              </div>
              
              <div className="flex gap-2">
                {comment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleModerate(comment.id, 'approved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleModerate(comment.id, 'rejected')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </>
                )}
                
                {comment.status === 'rejected' && (
                  <button
                    onClick={() => handleModerate(comment.id, 'approved')}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                  >
                    Aprovar
                  </button>
                )}
                
                {comment.status === 'approved' && (
                  <button
                    onClick={() => handleModerate(comment.id, 'rejected')}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Rejeitar
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="px-3 py-1 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
