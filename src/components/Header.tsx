"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/85 border-b border-neutral-200 supports-[backdrop-filter]:bg-white/70">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          ALANIZ.COM.BR
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/categorias"
            className={isActive("/categorias") ? "font-medium" : "opacity-80"}
          >
            Categorias
          </Link>
          <Link href="/blog" className={isActive("/blog") ? "font-medium" : "opacity-80"}>
            Blog
          </Link>
          <Link href="/sobre" className={isActive("/sobre") ? "font-medium" : "opacity-80"}>
            Sobre
          </Link>
          <Link href="/contato" className={isActive("/contato") ? "font-medium" : "opacity-80"}>
            Contato
          </Link>
        </nav>
      </div>
    </header>
  );
}

