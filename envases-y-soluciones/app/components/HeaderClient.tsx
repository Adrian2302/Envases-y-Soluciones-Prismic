"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/app/context/CartContext";

export default function HeaderClient() {
  const { totalItems, setIsCartOpen } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleCatalogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === "/") {
      // Already on home page, just scroll
      document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to home and then scroll
      router.push("/#catalogo");
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 sm:gap-2 shrink-0">
            <span className="font-montserrat text-lg sm:text-2xl font-bold text-[#4a6741]">ENVASES</span>
            <span className="font-montserrat text-lg sm:text-2xl font-bold text-gray-700">&</span>
            <span className="font-montserrat text-lg sm:text-2xl font-bold text-[#4a6741]">SOLUCIONES</span>
          </Link>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            <a
              href="/#catalogo"
              onClick={handleCatalogoClick}
              className="font-montserrat text-gray-600 hover:text-[#4a6741] transition-colors cursor-pointer"
            >
              Catálogo
            </a>
            <Link href="/promociones" className="font-montserrat text-gray-600 hover:text-[#4a6741] transition-colors">
              Promociones
            </Link>
          </nav>

          {/* WhatsApp and Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/50612345678"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#25D366] text-white rounded-full hover:bg-[#128C7E] transition-colors"
              aria-label="Contactar por WhatsApp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-[#4a6741] transition-colors cursor-pointer"
              aria-label="Ver cotización"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#4a6741] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
