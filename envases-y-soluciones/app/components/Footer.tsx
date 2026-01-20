import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-5 gap-6">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-[#7cb342]">ENVASES</span>
              <span className="text-2xl font-bold">&</span>
              <span className="text-2xl font-bold text-[#7cb342]">SOLUCIONES</span>
            </div>
            <p className="text-gray-400 mb-4">
              Tu proveedor confiable de envases de vidrio y soluciones sostenibles
              para tu negocio.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-playfair font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/#catalogo" className="hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/promociones" className="hover:text-white transition-colors">
                  Promociones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="font-playfair font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <span>info@envasesysoluciones.com</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <span>+506 1234 5678</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span>
                <span>Costa Rica</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>© 2026 Envases y Soluciones. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
