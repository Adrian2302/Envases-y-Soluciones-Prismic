import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import PromocionesClient from "./PromocionesClient";
import {
  getHomePageData,
  Producto,
  extractText,
  REVALIDATE_TIME,
} from "@/lib/prismic";

export const metadata = {
  title: "Promociones | Envases y Soluciones",
  description: "Descubre nuestras ofertas y promociones en envases de vidrio",
};

// ISR - revalidate page every hour
export const revalidate = REVALIDATE_TIME;

interface PrismicDocument {
  id: string;
  uid?: string;
  slugs?: string[];
  data?: {
    nombre?: unknown;
  };
}

// Check if a product has any variant with discount
function hasDiscount(producto: Producto): boolean {
  return producto.data.variantes?.some(
    (v) => v.descuento && v.precio_con_descuento && v.precio_con_descuento < v.precio
  ) || false;
}

export default async function PromocionesPage() {
  // Use the same cached data as home page
  const { productos, categorias: categoriasData, materiales: materialesData, colores: coloresData } =
    await getHomePageData();

  // Filter only products with discounts
  const productosConDescuento = productos.filter(hasDiscount);

  // Format filter options (same as main page)
  const categorias = (categoriasData as PrismicDocument[]).map((cat) => ({
    id: cat.id,
    slug: cat.uid || cat.slugs?.[0] || "",
    name: extractText(cat.data?.nombre) || cat.uid || cat.slugs?.[0] || "",
  }));

  const materiales = (materialesData as PrismicDocument[]).map((mat) => ({
    id: mat.id,
    slug: mat.uid || mat.slugs?.[0] || "",
    name: extractText(mat.data?.nombre) || mat.uid || mat.slugs?.[0] || "",
  }));

  const colores = (coloresData as PrismicDocument[]).map((col) => ({
    id: col.id,
    slug: col.uid || col.slugs?.[0] || "",
    name: extractText(col.data?.nombre) || col.uid || col.slugs?.[0] || "",
  }));

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-gray-800 mb-2">
            🔥 Promociones
          </h1>
          <p className="font-montserrat text-gray-600">
            Aprovecha nuestras ofertas especiales en envases de vidrio con descuento.
          </p>
        </div>

        {productosConDescuento.length > 0 ? (
          <PromocionesClient
            productos={productosConDescuento}
            categorias={categorias}
            materiales={materiales}
            colores={colores}
          />
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <p className="text-gray-500 text-lg">
              No hay promociones disponibles en este momento.
            </p>
            <p className="text-gray-400 mt-2">
              ¡Vuelve pronto para ver nuestras ofertas!
            </p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
