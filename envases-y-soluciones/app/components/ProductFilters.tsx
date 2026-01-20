"use client";

interface FilterOption {
  id: string;
  slug: string;
  name: string;
}

interface ProductFiltersProps {
  categorias: FilterOption[];
  materiales: FilterOption[];
  colores: FilterOption[];
  selectedCategorias: string[];
  selectedMateriales: string[];
  selectedColores: string[];
  searchQuery: string;
  onCategoriaChange: (value: string[]) => void;
  onMaterialChange: (value: string[]) => void;
  onColorChange: (value: string[]) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  categorias,
  materiales,
  colores,
  selectedCategorias,
  selectedMateriales,
  selectedColores,
  searchQuery,
  onCategoriaChange,
  onMaterialChange,
  onColorChange,
  onSearchChange,
  onClearFilters,
}: ProductFiltersProps) {
  const hasActiveFilters =
    selectedCategorias.length > 0 || selectedMateriales.length > 0 || selectedColores.length > 0 || searchQuery;

  const toggleFilter = (currentValues: string[], value: string, onChange: (values: string[]) => void) => {
    if (currentValues.includes(value)) {
      onChange(currentValues.filter((v) => v !== value));
    } else {
      onChange([...currentValues, value]);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar producto
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a6741] focus:border-transparent outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Categoría */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría {selectedCategorias.length > 0 && <span className="text-[#4a6741]">({selectedCategorias.length})</span>}
        </label>
        <div className="space-y-2">
          {categorias.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedCategorias.includes(cat.slug)}
                onChange={() => toggleFilter(selectedCategorias, cat.slug, onCategoriaChange)}
                className="w-4 h-4 text-[#4a6741] border-gray-300 rounded focus:ring-[#4a6741]"
              />
              <span className="text-sm text-gray-600 capitalize">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Material */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Material {selectedMateriales.length > 0 && <span className="text-[#4a6741]">({selectedMateriales.length})</span>}
        </label>
        <div className="space-y-2">
          {materiales.map((mat) => (
            <label key={mat.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMateriales.includes(mat.slug)}
                onChange={() => toggleFilter(selectedMateriales, mat.slug, onMaterialChange)}
                className="w-4 h-4 text-[#4a6741] border-gray-300 rounded focus:ring-[#4a6741]"
              />
              <span className="text-sm text-gray-600 capitalize">{mat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color {selectedColores.length > 0 && <span className="text-[#4a6741]">({selectedColores.length})</span>}
        </label>
        <div className="space-y-2">
          {colores.map((col) => (
            <label key={col.id} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedColores.includes(col.slug)}
                onChange={() => toggleFilter(selectedColores, col.slug, onColorChange)}
                className="w-4 h-4 text-[#4a6741] border-gray-300 rounded focus:ring-[#4a6741]"
              />
              <span className="text-sm text-gray-600 capitalize">{col.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
