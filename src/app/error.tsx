'use client';

import type { Metadata } from "next";
import { useEffect } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Erro • ALANIZ",
  description: "Ocorreu um erro inesperado. Tente novamente.",
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-neutral-900 mb-4">Erro</h1>
        <h2 className="text-2xl font-semibold text-neutral-700 mb-4">
          Algo deu errado
        </h2>
        <p className="text-neutral-600 mb-8">
          Ocorreu um erro inesperado. Tente novamente.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors mr-4"
        >
          Tentar novamente
        </button>
        <Link
          href="/"
          className="inline-block bg-neutral-200 text-neutral-900 px-6 py-3 rounded-lg hover:bg-neutral-300 transition-colors"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
