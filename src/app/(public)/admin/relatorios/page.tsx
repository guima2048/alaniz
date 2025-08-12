"use client";

import { useState, useEffect } from "react";

interface Site {
  slug: string;
  name: string;
  url?: string;
  logo?: string;
  cover?: string;
  hero?: string;
}

interface ProcessResult {
  slug: string;
  name: string;
  url: string;
  success: boolean;
  errors: string[];
  imagesFound: {
    logo: boolean;
    cover: boolean;
    hero: boolean;
  };
  imagesUpdated: {
    logo: boolean;
    cover: boolean;
    hero: boolean;
  };
  originalImages: {
    logo?: string;
    cover?: string;
    hero?: string;
  };
  newImages: {
    logo?: string;
    cover?: string;
    hero?: string;
  };
}

export default function RelatoriosPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [results, setResults] = useState<ProcessResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSite, setCurrentSite] = useState<string>("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [summary, setSummary] = useState({
    total: 0,
    success: 0,
    failed: 0,
    noUrl: 0,
    networkError: 0,
    noImages: 0
  });
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [filterText, setFilterText] = useState("");
  const [loadingSites, setLoadingSites] = useState(true);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      setLoadingSites(true);
      console.log("🔄 Carregando sites...");
      const response = await fetch('/api/admin/sites-list');
      console.log("📡 Resposta da API:", response.status, response.statusText);
      
      if (response.ok) {
        const sitesData = await response.json();
        console.log("✅ Sites carregados:", sitesData.length);
        setSites(sitesData);
      } else {
        console.error("❌ Erro ao carregar sites:", response.statusText);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar sites:", error);
    } finally {
      setLoadingSites(false);
    }
  };

  const processAllSites = async (selectedSlugs?: string[]) => {
    const sitesToProcess = selectedSlugs 
      ? sites.filter(site => selectedSlugs.includes(site.slug))
      : sites;
    
    setIsProcessing(true);
    setResults([]);
    setProgress({ current: 0, total: sitesToProcess.length });
    
    const newResults: ProcessResult[] = [];
    let successCount = 0;
    let failedCount = 0;
    let noUrlCount = 0;
    let networkErrorCount = 0;
    let noImagesCount = 0;

    for (let i = 0; i < sitesToProcess.length; i++) {
      const site = sitesToProcess[i];
      setCurrentSite(site.name);
              setProgress({ current: i + 1, total: sitesToProcess.length });

      const result: ProcessResult = {
        slug: site.slug,
        name: site.name,
        url: site.url || "",
        success: false,
        errors: [],
        imagesFound: { logo: false, cover: false, hero: false },
        imagesUpdated: { logo: false, cover: false, hero: false },
        originalImages: {
          logo: site.logo,
          cover: site.cover,
          hero: site.hero
        },
        newImages: {}
      };

      // Verificar se tem URL
      if (!site.url) {
        result.errors.push("❌ URL não informada");
        noUrlCount++;
        newResults.push(result);
        continue;
      }

      try {
        // Processar cada tipo de imagem
        const types = ['logos', 'covers', 'heroes'] as const;
        
                 for (const type of types) {
           try {
             console.log(`🔄 Processando ${type} para ${site.name}...`);
             const res = await fetch("/api/media/fetch-and-save", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                 url: site.url,
                 type,
                 slug: site.slug
               })
             });

             console.log(`📡 Resposta para ${type}:`, res.status, res.statusText);

             if (res.ok) {
               const data = await res.json();
               console.log(`✅ Sucesso para ${type}:`, data);
               result.imagesFound[type.slice(0, -1) as 'logo' | 'cover' | 'hero'] = true;
               result.imagesUpdated[type.slice(0, -1) as 'logo' | 'cover' | 'hero'] = true;
               result.newImages[type.slice(0, -1) as 'logo' | 'cover' | 'hero'] = data.path;
               
               // Atualizar no banco de dados
               try {
                 const updateRes = await fetch("/api/admin/update-site-images", {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                   slug: site.slug,
                   images: { [type.slice(0, -1)]: data.path }
                 })
                 });
                 
                 if (!updateRes.ok) {
                   result.errors.push(`⚠️ ${type}: Falha ao salvar no banco`);
                 }
               } catch {
                 result.errors.push(`⚠️ ${type}: Erro ao salvar no banco`);
               }
             } else {
               const error = await res.json();
               console.log(`❌ Erro para ${type}:`, error);
               result.errors.push(`❌ ${type}: ${error.error}`);
             }
          } catch {
            result.errors.push(`❌ ${type}: Erro de rede`);
            networkErrorCount++;
          }
        }

        // Verificar se pelo menos uma imagem foi encontrada
        const hasAnyImage = Object.values(result.imagesFound).some(found => found);
        if (!hasAnyImage) {
          result.errors.push("❌ Nenhuma imagem encontrada no site");
          noImagesCount++;
        }

        // Marcar como sucesso se pelo menos uma imagem foi atualizada
        const hasAnyUpdate = Object.values(result.imagesUpdated).some(updated => updated);
        if (hasAnyUpdate) {
          result.success = true;
          successCount++;
        } else {
          failedCount++;
        }

      } catch (error) {
        result.errors.push(`❌ Erro geral: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        failedCount++;
      }

      newResults.push(result);
      setResults([...newResults]);

      // Pequena pausa entre sites para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setSummary({
      total: sitesToProcess.length,
      success: successCount,
      failed: failedCount,
      noUrl: noUrlCount,
      networkError: networkErrorCount,
      noImages: noImagesCount
    });

    setIsProcessing(false);
    setCurrentSite("");
  };

  const exportResults = () => {
    const csv = [
      "Slug,Nome,URL,Sucesso,Logo Encontrado,Logo Atualizado,Capa Encontrada,Capa Atualizada,Hero Encontrado,Hero Atualizado,Erros",
      ...results.map(r => [
        r.slug,
        r.name,
        r.url,
        r.success ? "Sim" : "Não",
        r.imagesFound.logo ? "Sim" : "Não",
        r.imagesUpdated.logo ? "Sim" : "Não",
        r.imagesFound.cover ? "Sim" : "Não",
        r.imagesUpdated.cover ? "Sim" : "Não",
        r.imagesFound.hero ? "Sim" : "Não",
        r.imagesUpdated.hero ? "Sim" : "Não",
        r.errors.join("; ")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio-imagens-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Relatório de Atualização de Imagens</h1>
      
      {/* Resumo */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">📈 Resumo Geral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-gray-600">Total de Sites</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.success}</div>
            <div className="text-sm text-gray-600">Sucessos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
            <div className="text-sm text-gray-600">Falhas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.noUrl}</div>
            <div className="text-sm text-gray-600">Sem URL</div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">🔍 Seleção de Sites</h3>
          <div className="flex flex-wrap gap-4 items-center mb-4">
            <input
              type="text"
              placeholder="Filtrar sites por nome..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setSelectedSites(sites.filter(s => s.url && s.name.toLowerCase().includes(filterText.toLowerCase())).map(s => s.slug))}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Selecionar Filtrados
            </button>
            <button
              onClick={() => setSelectedSites([])}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Limpar Seleção
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {selectedSites.length > 0 ? (
              <span>✅ {selectedSites.length} site(s) selecionado(s)</span>
            ) : (
              <span>ℹ️ Nenhum site selecionado - processará todos os sites</span>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => processAllSites(selectedSites.length > 0 ? selectedSites : undefined)}
            disabled={isProcessing}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "🔄 Processando..." : `🚀 Atualizar ${selectedSites.length > 0 ? selectedSites.length : 'Todas as'} Imagens`}
          </button>
          
          {results.length > 0 && (
            <button
              onClick={exportResults}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Exportar CSV
            </button>
          )}
          
          {isProcessing && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Processando: {currentSite} ({progress.current}/{progress.total})
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">📋 Resultados Detalhados</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Site</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">URL</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Logo</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Capa</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Hero</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Erros</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result, index) => (
                  <tr key={index} className={result.success ? "bg-green-50" : "bg-red-50"}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {result.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {result.success ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Sucesso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          ❌ Falha
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {result.imagesFound.logo ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        {result.imagesUpdated.logo && (
                          <span className="text-xs text-blue-600">Atualizado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {result.imagesFound.cover ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        {result.imagesUpdated.cover && (
                          <span className="text-xs text-blue-600">Atualizado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {result.imagesFound.hero ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        {result.imagesUpdated.hero && (
                          <span className="text-xs text-blue-600">Atualizado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-red-600">
                        {result.errors.map((error, i) => (
                          <div key={i} className="mb-1">{error}</div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

             {/* Lista de Sites */}
       <div className="bg-white rounded-lg shadow mt-6">
         <div className="p-6 border-b">
           <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold">📋 Lista de Sites</h2>
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-600">{sites.length} sites</span>
               <button
                 onClick={loadSites}
                 className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
               >
                 🔄
               </button>
             </div>
           </div>
         </div>
         <div className="p-6">
           {loadingSites ? (
             <div className="flex items-center justify-center py-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
               <span className="text-gray-600">Carregando sites...</span>
             </div>
           ) : sites.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-8">
               <span className="text-gray-600 mb-4">Nenhum site encontrado</span>
               <button
                 onClick={loadSites}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                 🔄 Recarregar Sites
               </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {sites
              .filter(site => !filterText || site.name.toLowerCase().includes(filterText.toLowerCase()))
              .map((site, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedSites.includes(site.slug)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    if (selectedSites.includes(site.slug)) {
                      setSelectedSites(selectedSites.filter(s => s !== site.slug));
                    } else {
                      setSelectedSites([...selectedSites, site.slug]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-500">{site.slug}</div>
                      {site.url && (
                        <div className="text-xs text-blue-600 truncate">{site.url}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {selectedSites.includes(site.slug) && (
                        <span className="text-blue-600">✓</span>
                      )}
                      {!site.url && (
                        <span className="text-xs text-red-600">Sem URL</span>
                      )}
                    </div>
                  </div>
                </div>
                             ))}
             </div>
           )}
         </div>
       </div>

      {/* Sites sem URL */}
      {sites.filter(s => !s.url).length > 0 && (
        <div className="bg-white rounded-lg shadow mt-6">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-red-600">⚠️ Sites Sem URL</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.filter(s => !s.url).map((site, index) => (
                <div key={index} className="p-3 border border-red-200 rounded bg-red-50">
                  <div className="font-medium text-red-800">{site.name}</div>
                  <div className="text-sm text-red-600">{site.slug}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
