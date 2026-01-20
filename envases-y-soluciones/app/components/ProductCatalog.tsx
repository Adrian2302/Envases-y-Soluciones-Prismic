"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Producto, extractText } from "@/lib/prismic";
import ProductCard from "./ProductCard";
import ProductFilters from "./ProductFilters";

const PRODUCTS_PER_PAGE = 15;

interface FilterOption {
  id: string;
  slug: string;
  name: string;
}

interface ProductCatalogProps {
  productos: Producto[];
  categorias: FilterOption[];
  materiales: FilterOption[];
  colores: FilterOption[];
}

export default function ProductCatalog({
  productos,
  categorias,
  materiales,
  colores,
}: ProductCatalogProps) {
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get("pagina");
    return pageParam ? Math.max(1, parseInt(pageParam, 10)) : 1;
  });

  // Update URL when filters change
  const updateURL = useCallback((
    cats: string[],
    mats: string[],
    cols: string[],
    query: string,
    page: number
  ) => {
    const params = new URLSearchParams();
    if (cats.length > 0) params.set("categorias", cats.join(","));
    if (mats.length > 0) params.set("materiales", mats.join(","));
    if (cols.length > 0) params.set("colores", cols.join(","));
    if (query) params.set("q", query);
    if (page > 1) params.set("pagina", page.toString());

    const newURL = params.toString() ? `${pathname}?${params.toString()}#catalogo` : `${pathname}#catalogo`;
    router.replace(newURL, { scroll: false });
  }, [pathname, router]);

  // Sync URL when filters or page change
  useEffect(() => {
    updateURL(selectedCategorias, selectedMateriales, selectedColores, searchQuery, currentPage);
  }, [selectedCategorias, selectedMateriales, selectedColores, searchQuery, currentPage, updateURL]);

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

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategorias, selectedMateriales, selectedColores]);

  // Ensure current page is valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Products to display (paginated)
  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to catalog section
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleClearFilters = () => {
    setSelectedCategorias([]);
    setSelectedMateriales([]);
    setSelectedColores([]);
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Generate page numbers to display with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingsCount = 1; // Numbers to show on each side of current page

    // If total pages is small, show all
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    // Calculate range around current page
    const leftSibling = Math.max(currentPage - siblingsCount, 2);
    const rightSibling = Math.min(currentPage + siblingsCount, totalPages - 1);

    // Show left ellipsis if there's a gap after first page
    const showLeftEllipsis = leftSibling > 2;
    // Show right ellipsis if there's a gap before last page
    const showRightEllipsis = rightSibling < totalPages - 1;

    if (showLeftEllipsis) {
      pages.push("...");
    } else {
      // No ellipsis, show page 2
      if (leftSibling === 2) {
        pages.push(2);
      }
    }

    // Show pages around current (excluding first and last which are always shown)
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages && !pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showRightEllipsis) {
      pages.push("...");
    } else {
      // No ellipsis, show second to last page
      if (rightSibling === totalPages - 1 && !pages.includes(totalPages - 1)) {
        pages.push(totalPages - 1);
      }
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  return (
    <section id="catalogo" className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="font-playfair text-3xl font-bold text-gray-800 mb-2">
            Nuestro Catálogo
          </h2>
          <p className="font-montserrat text-gray-600">
            Descubre nuestra selección de envases de vidrio para todo tipo de productos.
          </p>
        </div>

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
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Mostrando productos {displayedProducts.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0}
                {" a "}
                {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} de {filteredProducts.length}
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </p>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedProducts.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg font-montserrat text-sm transition-colors ${currentPage === 1
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-200"
                        }`}
                      aria-label="Página anterior"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 py-1 text-gray-500"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page as number)}
                            className={`min-w-[40px] px-3 py-2 rounded-lg font-montserrat text-sm transition-colors ${currentPage === page
                                ? "bg-[#4a6741] text-white"
                                : "text-gray-700 hover:bg-gray-200"
                              }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg font-montserrat text-sm transition-colors ${currentPage === totalPages
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-gray-700 hover:bg-gray-200"
                        }`}
                      aria-label="Página siguiente"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-playfair text-lg font-medium text-gray-800 mb-2">
                  No se encontraron productos
                </h3>
                <p className="font-montserrat text-gray-500 mb-4">
                  Intenta ajustar los filtros o buscar con otras palabras
                </p>
                <button
                  onClick={handleClearFilters}
                  className="font-montserrat text-[#4a6741] hover:underline"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
