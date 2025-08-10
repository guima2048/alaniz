"use client";
import { useEffect, useState } from "react";

const KEY = "consent.accepted.v1";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(KEY);
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto max-w-3xl m-4 rounded-lg border border-neutral-200 bg-white shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-sm text-neutral-700">
          Utilizamos cookies funcionais para melhorar sua experiência. Ao continuar,
          você concorda com nossa política de cookies.
        </p>
        <button
          className="rounded-md bg-neutral-900 text-white text-sm px-3 py-2 hover:bg-neutral-800"
          onClick={() => {
            localStorage.setItem(KEY, "1");
            setVisible(false);
          }}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}

