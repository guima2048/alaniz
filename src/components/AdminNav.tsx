"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/site", label: "Sites", icon: "🌐", features: ["CRUD completo", "Deletar"] },
  { href: "/admin/post", label: "Posts", icon: "📝", features: ["CRUD completo", "Deletar"] },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷️", features: ["CRUD completo", "Deletar"] },
  { href: "/admin/comentarios", label: "Comentários", icon: "💬", features: ["Visualizar", "Deletar", "Paginação"] },
  { href: "/admin/sobre", label: "Sobre", icon: "ℹ️", features: ["Editar conteúdo"] },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-neutral-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link 
              href="/admin" 
              className="text-lg font-semibold text-neutral-900 hover:text-neutral-700"
            >
              🛠️ Admin Panel
            </Link>
            
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }`}
                    title={item.features?.join(", ")}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                    {item.features?.includes("Deletar") && (
                      <span className="ml-1 text-xs bg-red-100 text-red-700 px-1 rounded">🗑️</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-neutral-600 hover:text-neutral-900"
              onClick={() => {
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden');
                }
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" className="hidden md:hidden pb-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                  }`}
                  title={item.features?.join(", ")}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                  {item.features?.includes("Deletar") && (
                    <span className="ml-1 text-xs bg-red-100 text-red-700 px-1 rounded">🗑️</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
