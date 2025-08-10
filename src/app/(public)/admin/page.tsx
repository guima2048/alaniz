"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const FIXED_USERNAME = "admin";
const FIXED_PASSWORD = "casal1010";
const SESSION_KEY = "admin.session";

type AuthState = { isLoggedIn: boolean };

function loadAuthState(): AuthState {
  if (typeof window === "undefined") return { isLoggedIn: false };
  return { isLoggedIn: window.localStorage.getItem(SESSION_KEY) === "true" };
}

export default function AdminLoginPage() {
  const [{ isLoggedIn }, setState] = useState<AuthState>({ isLoggedIn: false });
  const router = useRouter();

  useEffect(() => {
    setState(loadAuthState());
  }, []);

  const handleLogin = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "");
    if (username === FIXED_USERNAME && password === FIXED_PASSWORD) {
      window.localStorage.setItem(SESSION_KEY, "true");
      setState({ isLoggedIn: true });
      router.push("/admin/post");
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
      <div className="max-w-2xl mx-auto mt-16 p-6 border rounded-lg shadow-sm bg-white space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin</h1>
          <button onClick={handleLogout} className="px-3 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200">Sair</button>
        </div>
        <p>Escolha uma seção para gerenciar:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link href="/admin/site" className="border rounded p-4 hover:bg-gray-50">ALANIZ.COM.BR (Sites)</Link>
          <Link href="/admin/post" className="border rounded p-4 hover:bg-gray-50">Blog (Posts)</Link>
          <Link href="/admin/sobre" className="border rounded p-4 hover:bg-gray-50">Página Sobre</Link>
          <Link href="/admin/categorias" className="border rounded p-4 hover:bg-gray-50">Categorias</Link>
        </div>
      </div>
    );
  }, [isLoggedIn, handleLogin, handleLogout]);

  return content;
}


