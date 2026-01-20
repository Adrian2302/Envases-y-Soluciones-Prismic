import Image from "next/image";
import Link from "next/link";
import { Producto, extractText, optimizeImageUrl, imageSizes, getBlurDataUrl } from "@/lib/prismic";

interface ProductCardProps {
  producto: Producto;
}

export default function ProductCard({ producto }: ProductCardProps) {
  const { data, uid } = producto;
  const primeraImagen = data.imagenes?.[0]?.imagen;
  const primeraVariante = data.variantes?.[0];
  const nombre = extractText(data.nombre);

  // Optimize image URL for thumbnail size
  const optimizedImageUrl = primeraImagen?.url
    ? optimizeImageUrl(primeraImagen.url, imageSizes.thumbnail)
    : null;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-4 flex flex-col">
      {/* Image */}
      <div className="relative w-full h-48 mb-4 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
        {optimizedImageUrl ? (
          <Image
            src={optimizedImageUrl}
            alt={primeraImagen?.alt || nombre}
            fill
            className="object-contain p-2"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            placeholder="blur"
            blurDataURL={getBlurDataUrl()}
            loading="lazy"
          />
        ) : (
          <div className="text-6xl text-gray-300">🫙</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="font-playfair font-semibold text-gray-800 mb-2 line-clamp-2">
          {nombre}
        </h3>

        {/* Price */}
        {primeraVariante && (
          <div className="mb-3">
            {primeraVariante.descuento && primeraVariante.precio_con_descuento ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#4a6741]">
                  ₡{primeraVariante.precio_con_descuento.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  ₡{primeraVariante.precio.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-[#4a6741]">
                ₡{primeraVariante.precio.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Availability badge */}
        <div className="mb-3">
          {data.producto_disponible ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Disponible
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              No disponible
            </span>
          )}
        </div>

        {/* Button */}
        <Link
          href={`/producto/${uid}`}
          className="font-montserrat mt-auto bg-[#4a6741] text-white text-center py-2 px-4 rounded-lg hover:bg-[#3d5636] transition-colors font-medium"
        >
          Consultar
        </Link>
      </div>
    </div>
  );
}
