import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 mt-10">
      <div className="container mx-auto px-4 py-8 text-sm text-neutral-600 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="opacity-80">© {new Date().getFullYear()} ALANIZ.COM.BR</div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/legais/termos" className="hover:underline">
            Termos
          </Link>
          <Link href="/legais/privacidade" className="hover:underline">
            Privacidade
          </Link>
          <Link href="/legais/cookies" className="hover:underline">
            Cookies
          </Link>
          <Link href="/sobre" className="hover:underline">
            Sobre
          </Link>
          <Link href="/contato" className="hover:underline">
            Contato
          </Link>
        </nav>
      </div>
    </footer>
  );
}




