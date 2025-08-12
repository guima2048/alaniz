"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const KEY = "cookie-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(KEY);
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(KEY, "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-3xl m-4 rounded-lg border border-neutral-200 bg-white shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between consent-banner">
        <div className="flex-1">
          <p className="text-sm text-neutral-700">
            Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa{" "}
            <Link href="/legais/privacidade" className="text-neutral-900 underline hover:no-underline">
              política de privacidade
            </Link>
            .
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={accept}
            className="px-4 py-2 bg-neutral-900 text-white text-sm rounded-md hover:bg-neutral-800 transition-colors"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}

