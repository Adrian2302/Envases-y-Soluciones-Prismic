import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import ImageGallery from "@/app/components/ImageGallery";
import ProductVariants from "@/app/components/ProductVariants";
import Toast from "@/app/components/Toast";
import { getCachedProductoByUID, getAllProductos, extractText, optimizeImageUrl, imageSizes, REVALIDATE_TIME } from "@/lib/prismic";

// ISR - revalidate page every hour
export const revalidate = REVALIDATE_TIME;

interface PageProps {
  params: Promise<{ uid: string }>;
}

export async function generateStaticParams() {
  const productos = await getAllProductos();
  return productos.map((producto) => ({
    uid: producto.uid,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { uid } = await params;
  const producto = await getCachedProductoByUID(uid);

  if (!producto) {
    return {
      title: "Producto no encontrado",
    };
  }

  return {
    title: `${extractText(producto.data.nombre)} | Envases y Soluciones`,
    description: producto.data.descripcion?.[0]?.text || "",
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { uid } = await params;
  const producto = await getCachedProductoByUID(uid);

  if (!producto) {
    notFound();
  }

  const { data } = producto;
  const imagenes = data.imagenes || [];
  const nombre = extractText(data.nombre);

  // If product is not available, mark all variants as unavailable
  const variantes = (data.variantes || []).map((v) => ({
    ...v,
    variante_disponible: data.producto_disponible ? v.variante_disponible : false,
  }));

  // Get lid colors for the cart
  const lidColors = (data.colores_de_tapa || []).map(
    (col: { color_de_tapa: { slug: string } }) => col.color_de_tapa.slug
  );

  // Get product image for cart - use cartThumb size for smallest possible image
  const productImage = imagenes[0]?.imagen?.url
    ? optimizeImageUrl(imagenes[0].imagen.url, imageSizes.cartThumb)
    : "";

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#4a6741]">
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/#catalogo" className="text-gray-500 hover:text-[#4a6741]">
                Catálogo
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="font-montserrat text-gray-800 font-medium">{nombre}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8 p-8">
            {/* Images Section */}
            <ImageGallery imagenes={imagenes} nombre={nombre} />

            {/* Product Info Section */}
            <div>
              <h1 className="font-playfair text-3xl font-bold text-gray-800 mb-4">
                {nombre}
              </h1>

              {/* Availability + WhatsApp */}
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                {data.producto_disponible ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ✗ No disponible
                  </span>
                )}
                <a
                  href={`https://wa.me/50612345678?text=Hola, me interesa el producto: ${encodeURIComponent(nombre)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1 rounded-full hover:bg-[#128C7E] transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Description */}
              {data.descripcion && data.descripcion.length > 0 && (
                <div className="mb-6">
                  <h2 className="font-playfair text-lg font-semibold text-gray-800 mb-2">
                    Descripción
                  </h2>
                  <div className="font-montserrat text-gray-600">
                    {data.descripcion.map((block, index) => (
                      <p key={index}>{block.text}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Categories, Materials, Colors */}
              <div className="mb-6 space-y-3">
                {data.categorias && data.categorias.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat text-sm font-medium text-gray-700">Categoría:</span>
                    <div className="flex flex-wrap gap-1">
                      {data.categorias.map((cat) => (
                        <span
                          key={cat.categoria.id}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600 capitalize"
                        >
                          {cat.categoria.slug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.materiales && data.materiales.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat text-sm font-medium text-gray-700">Material:</span>
                    <div className="flex flex-wrap gap-1">
                      {data.materiales.map((mat) => (
                        <span
                          key={mat.material.id}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600 capitalize"
                        >
                          {mat.material.slug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.colores && data.colores.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat text-sm font-medium text-gray-700">Color:</span>
                    <div className="flex flex-wrap gap-1">
                      {data.colores.map((col) => (
                        <span
                          key={col.color.id}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600 capitalize"
                        >
                          {col.color.slug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {data.colores_de_tapa && data.colores_de_tapa.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="font-montserrat text-sm font-medium text-gray-700">Color de tapa:</span>
                    <div className="flex flex-wrap gap-1">
                      {data.colores_de_tapa.map((col) => (
                        <span
                          key={col.color_de_tapa.id}
                          className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600 capitalize"
                        >
                          {col.color_de_tapa.slug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Variants Section */}
              {variantes.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <ProductVariants
                    variantes={variantes}
                    productId={producto.uid || ""}
                    productName={nombre}
                    productImage={productImage}
                    lidColors={lidColors}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back button */}
        <div className="mt-8">
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-2 text-[#4a6741] hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </Link>
        </div>
      </div>

      <Toast />
      <Footer />
    </main>
  );
}
