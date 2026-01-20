"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Producto, extractText } from "@/lib/prismic";
import ProductCard from "@/app/components/ProductCard";
import ProductFilters from "@/app/components/ProductFilters";

interface FilterOption {
  id: string;
  slug: string;
  name: string;
}

interface PromocionesClientProps {
  productos: Producto[];
  categorias: FilterOption[];
  materiales: FilterOption[];
  colores: FilterOption[];
}

export default function PromocionesClient({
  productos,
  categorias,
  materiales,
  colores,
}: PromocionesClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize state from URL params
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>(() => {
    const param = searchParams.get("categorias");
    return param ? param.split(",") : [];
  });
  const [selectedMateriales, setSelectedMateriales] = useState<string[]>(() => {
    const param = searchParams.get("materiales");
    return param ? param.split(",") : [];
  });
  const [selectedColores, setSelectedColores] = useState<string[]>(() => {
    const param = searchParams.get("colores");
    return param ? param.split(",") : [];
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return searchParams.get("q") || "";
  });

  // Update URL when filters change
  const updateURL = useCallback((
    cats: string[],
    mats: string[],
    cols: string[],
    query: string
  ) => {
    const params = new URLSearchParams();
    if (cats.length > 0) params.set("categorias", cats.join(","));
    if (mats.length > 0) params.set("materiales", mats.join(","));
    if (cols.length > 0) params.set("colores", cols.join(","));
    if (query) params.set("q", query);
    
    const newURL = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newURL, { scroll: false });
  }, [pathname, router]);

  // Sync URL when filters change
  useEffect(() => {
    updateURL(selectedCategorias, selectedMateriales, selectedColores, searchQuery);
  }, [selectedCategorias, selectedMateriales, selectedColores, searchQuery, updateURL]);

  const filteredProducts = useMemo(() => {
    return productos.filter((producto) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nombre = extractText(producto.data.nombre).toLowerCase();
        if (!nombre.includes(query)) {
          return false;
        }
      }

      // Categoria filter (any of selected)
      if (selectedCategorias.length > 0) {
        const hasCategoria = producto.data.categorias?.some(
          (cat) => selectedCategorias.includes(cat.categoria?.slug)
        );
        if (!hasCategoria) {
          return false;
        }
      }

      // Material filter (any of selected)
      if (selectedMateriales.length > 0) {
        const hasMaterial = producto.data.materiales?.some(
          (mat) => selectedMateriales.includes(mat.material?.slug)
        );
        if (!hasMaterial) {
          return false;
        }
      }

      // Color filter (any of selected)
      if (selectedColores.length > 0) {
        const hasColor = producto.data.colores?.some(
          (col) => selectedColores.includes(col.color?.slug)
        );
        if (!hasColor) {
          return false;
        }
      }

      return true;
    });
  }, [productos, searchQuery, selectedCategorias, selectedMateriales, selectedColores]);

  const handleClearFilters = () => {
    setSelectedCategorias([]);
    setSelectedMateriales([]);
    setSelectedColores([]);
    setSearchQuery("");
  };

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <ProductFilters
          categorias={categorias}
          materiales={materiales}
          colores={colores}
          selectedCategorias={selectedCategorias}
          selectedMateriales={selectedMateriales}
          selectedColores={selectedColores}
          searchQuery={searchQuery}
          onCategoriaChange={setSelectedCategorias}
          onMaterialChange={setSelectedMateriales}
          onColorChange={setSelectedColores}
          onSearchChange={setSearchQuery}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Products Grid */}
      <div className="lg:col-span-3">
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""} en promoción
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 mb-4">
              Intenta ajustar los filtros o buscar con otras palabras
            </p>
            <button
              onClick={handleClearFilters}
              className="text-[#4a6741] hover:underline cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
