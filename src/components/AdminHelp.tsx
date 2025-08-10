"use client";
import { useState } from "react";

export function AdminHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Botão de ajuda */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Ajuda do Admin"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Modal de ajuda */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-neutral-900">🎯 Funcionalidades Admin</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-neutral-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="font-medium text-green-700">✅ Sites</h4>
              <p className="text-neutral-600">CRUD completo + deletar</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="font-medium text-green-700">✅ Posts</h4>
              <p className="text-neutral-600">CRUD completo + deletar</p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="font-medium text-green-700">✅ Categorias</h4>
              <p className="text-neutral-600">CRUD completo + deletar</p>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3">
              <h4 className="font-medium text-blue-700">ℹ️ Sobre</h4>
              <p className="text-neutral-600">Editar conteúdo da página</p>
            </div>
            
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-xs">
                <strong>💡 Dica:</strong> Para deletar, selecione um item e clique no botão "Excluir" (vermelho).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
