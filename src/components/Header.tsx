"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-neutral-200 supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          ALANIZ
        </Link>
        
        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link
            href="/"
            className={isActive("/") ? "font-medium" : "opacity-80 hover:opacity-100"}
          >
            Home
          </Link>
          <Link
            href="/categorias"
            className={isActive("/categorias") ? "font-medium" : "opacity-80 hover:opacity-100"}
          >
            Categorias
          </Link>
          <Link 
            href="/blog" 
            className={isActive("/blog") ? "font-medium" : "opacity-80 hover:opacity-100"}
          >
            Blog
          </Link>
          <Link 
            href="/sobre" 
            className={isActive("/sobre") ? "font-medium" : "opacity-80 hover:opacity-100"}
          >
            Sobre
          </Link>
          <Link 
            href="/contato" 
            className={isActive("/contato") ? "font-medium" : "opacity-80 hover:opacity-100"}
          >
            Contato
          </Link>
        </nav>

        {/* Botão hambúrguer */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Abrir menu"
        >
          <div className="w-5 h-5 flex flex-col justify-center items-center">
            <span className={`block w-4 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-4 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
          </div>
        </button>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="container mx-auto px-4 py-2 flex flex-col space-y-1">
            <Link
              href="/"
              onClick={closeMenu}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                isActive("/") 
                  ? "bg-gray-100 font-medium text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Home
            </Link>
            <Link
              href="/categorias"
              onClick={closeMenu}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                isActive("/categorias") 
                  ? "bg-gray-100 font-medium text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Categorias
            </Link>
            <Link
              href="/blog"
              onClick={closeMenu}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                isActive("/blog") 
                  ? "bg-gray-100 font-medium text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/sobre"
              onClick={closeMenu}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                isActive("/sobre") 
                  ? "bg-gray-100 font-medium text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              onClick={closeMenu}
              className={`px-3 py-2 rounded-md text-sm transition-colors ${
                isActive("/contato") 
                  ? "bg-gray-100 font-medium text-gray-900" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              Contato
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

