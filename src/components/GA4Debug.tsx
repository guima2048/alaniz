"use client";
import { useEffect, useState } from "react";
import { ga4 } from "@/lib/gtm";

export function GA4Debug() {
  const [status, setStatus] = useState<{
    gtag: boolean;
    dataLayer: boolean;
    ga4Enabled: boolean;
    ga4Id: string;
  }>({
    gtag: false,
    dataLayer: false,
    ga4Enabled: false,
    ga4Id: "",
  });

  useEffect(() => {
    const checkStatus = () => {
      const gtagExists = typeof window !== "undefined" && !!(window as unknown as { gtag?: unknown }).gtag;
      const dataLayerExists = typeof window !== "undefined" && !!(window as unknown as { dataLayer?: unknown }).dataLayer;
      
      setStatus({
        gtag: gtagExists,
        dataLayer: dataLayerExists,
        ga4Enabled: ga4.enabled,
        ga4Id: ga4.id,
      });
    };

    // Verificar imediatamente
    checkStatus();

    // Verificar novamente após um delay
    const timer = setTimeout(checkStatus, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 GA4 Debug</h3>
      <div className="space-y-1">
        <div className={`flex justify-between ${status.ga4Enabled ? "text-green-400" : "text-red-400"}`}>
          <span>GA4 Habilitado:</span>
          <span>{status.ga4Enabled ? "✅" : "❌"}</span>
        </div>
        <div className="flex justify-between">
          <span>GA4 ID:</span>
          <span className="font-mono">{status.ga4Id || "Não configurado"}</span>
        </div>
        <div className={`flex justify-between ${status.gtag ? "text-green-400" : "text-red-400"}`}>
          <span>gtag função:</span>
          <span>{status.gtag ? "✅" : "❌"}</span>
        </div>
        <div className={`flex justify-between ${status.dataLayer ? "text-green-400" : "text-red-400"}`}>
          <span>dataLayer:</span>
          <span>{status.dataLayer ? "✅" : "❌"}</span>
        </div>
      </div>
      
      {!status.ga4Enabled && (
        <div className="mt-2 p-2 bg-red-900 rounded text-xs">
          <strong>Problema:</strong> GA4 não está habilitado.
          <br />
          Configure NEXT_PUBLIC_GA4_ID no .env.local
        </div>
      )}
      
      {status.ga4Enabled && !status.gtag && (
        <div className="mt-2 p-2 bg-yellow-900 rounded text-xs">
          <strong>Atenção:</strong> gtag não carregou.
          <br />
          Aguarde alguns segundos ou recarregue a página.
        </div>
      )}
      
      {status.gtag && (
        <div className="mt-2 p-2 bg-green-900 rounded text-xs">
          <strong>✅ GA4 funcionando!</strong>
          <br />
          Verifique o console para mais detalhes.
        </div>
      )}
    </div>
  );
}
