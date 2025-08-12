"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

function getCurrentYearSP() {
  return new Date().getFullYear();
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/site" className="text-xl font-bold text-neutral-900">
            ALANIZ
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/site"
              className={isActive("/") ? "font-medium" : "opacity-80 hover:opacity-100"}
            >
              Sites
            </Link>
            <Link
              href="/site"
              className={isActive("/categorias") ? "font-medium" : "opacity-80 hover:opacity-100"}
            >
              Categorias
            </Link>
            <Link
              href="/site"
              className={isActive("/blog") ? "font-medium" : "opacity-80 hover:opacity-100"}
            >
              Blog
            </Link>
            <Link
              href="/site"
              className={isActive("/sobre") ? "font-medium" : "opacity-80 hover:opacity-100"}
            >
              Sobre
            </Link>
            <Link
              href="/site"
              className={isActive("/contato") ? "font-medium" : "opacity-80 hover:opacity-100"}
            >
              Contato
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <span className={`block w-4 h-0.5 bg-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block w-4 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-4 h-0.5 bg-gray-600 transition-all duration-300 mt-1 ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/site"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Sites
              </Link>
              <Link
                href="/site"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Categorias
              </Link>
              <Link
                href="/site"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/site"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Sobre
              </Link>
              <Link
                href="/site"
                className="text-gray-600 hover:text-gray-900"
                onClick={() => setIsMenuOpen(false)}
              >
                Contato
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

