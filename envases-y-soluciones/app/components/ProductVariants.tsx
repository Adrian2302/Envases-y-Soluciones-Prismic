"use client";

import { useState } from "react";
import { useCart } from "@/app/context/CartContext";

interface Variante {
  codigo: string;
  capacidad: number;
  altura: number;
  diametro: number;
  precio: number;
  descuento: boolean;
  precio_con_descuento?: number | null;
  variante_disponible: boolean;
}

interface ProductVariantsProps {
  variantes: Variante[];
  productId: string;
  productName: string;
  productImage: string;
  lidColors: string[];
}

export default function ProductVariants({
  variantes,
  productId,
  productName,
  productImage,
  lidColors,
}: ProductVariantsProps) {
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [colorErrors, setColorErrors] = useState<Record<string, boolean>>({});

  const hasLidColors = lidColors.length > 0;
  const hasMultipleLidColors = lidColors.length > 1;
  const singleLidColor = lidColors.length === 1 ? lidColors[0] : null;

  const getQuantity = (codigo: string) => quantities[codigo] || 1;

  const setQuantity = (codigo: string, value: number) => {
    if (value < 1) value = 1;
    setQuantities((prev) => ({ ...prev, [codigo]: value }));
  };

  const getSelectedColor = (codigo: string) => selectedColors[codigo] || "";

  const setSelectedColor = (codigo: string, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [codigo]: color }));
    setColorErrors((prev) => ({ ...prev, [codigo]: false }));
  };

  const handleAddToCart = (variante: Variante) => {
    if (!variante.variante_disponible) return;

    if (hasMultipleLidColors && !getSelectedColor(variante.codigo)) {
      setColorErrors((prev) => ({ ...prev, [variante.codigo]: true }));
      return;
    }

    const selectedLidColor = singleLidColor || (hasMultipleLidColors ? getSelectedColor(variante.codigo) : undefined);

    addItem({
      productId,
      productName,
      productImage,
      variantCode: variante.codigo,
      capacity: variante.capacidad,
      height: variante.altura,
      diameter: variante.diametro,
      price: variante.precio,
      discountPrice: variante.precio_con_descuento ?? undefined,
      quantity: getQuantity(variante.codigo),
      selectedLidColor,
    });

    setQuantity(variante.codigo, 1);
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Variantes disponibles
      </h2>

      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {variantes.map((variante) => {
          return (
            <div
              key={variante.codigo}
              className={`border border-gray-200 rounded-lg p-3 transition-all ${variante.variante_disponible
                ? "bg-white hover:border-[#4a6741]/30"
                : "bg-gray-50 opacity-60"
                }`}
            >
              {/* Primera fila: Código y precio */}
              <div className="flex justify-between items-start gap-2 mb-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="font-semibold text-gray-800">{variante.codigo}</span>
                  {variante.variante_disponible ? (
                    <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded w-fit">✓</span>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded w-fit">✗</span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {variante.descuento && variante.precio_con_descuento ? (
                    <span className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-1">
                      <span className="font-bold text-[#4a6741]">₡{variante.precio_con_descuento.toLocaleString()}</span>
                      <span className="text-xs text-gray-400 line-through">₡{variante.precio.toLocaleString()}</span>
                    </span>
                  ) : (
                    <span className="font-bold text-[#4a6741]">₡{variante.precio.toLocaleString()}</span>
                  )}
                </div>
              </div>

              {/* Specs en línea separada */}
              <p className="text-sm text-gray-600 font-medium mb-2">
                {variante.capacidad}ml • {variante.altura}×{variante.diametro}cm
              </p>

              {/* Controles (solo si está disponible) */}
              {variante.variante_disponible && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Color de tapa */}
                  {hasLidColors && (
                    singleLidColor ? (
                      <span className="text-xs text-gray-600 capitalize bg-gray-100 px-2 py-1 rounded">Tapa: {singleLidColor}</span>
                    ) : (
                      <select
                        value={getSelectedColor(variante.codigo)}
                        onChange={(e) => setSelectedColor(variante.codigo, e.target.value)}
                        className={`text-sm border rounded px-2 py-1.5 bg-white w-full sm:w-auto sm:min-w-[140px] ${colorErrors[variante.codigo] ? "border-red-500" : "border-gray-200"
                          }`}
                      >
                        <option value="">Color de tapa...</option>
                        {lidColors.map((color) => (
                          <option key={color} value={color}>
                            {color}
                          </option>
                        ))}
                      </select>
                    )
                  )}

                  {/* Cantidad y botón en la misma línea */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setQuantity(variante.codigo, getQuantity(variante.codigo) - 1)}
                        className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={getQuantity(variante.codigo)}
                        onChange={(e) => setQuantity(variante.codigo, parseInt(e.target.value) || 1)}
                        className="w-10 text-center border border-gray-200 rounded py-1 text-xs"
                      />
                      <button
                        onClick={() => setQuantity(variante.codigo, getQuantity(variante.codigo) + 1)}
                        className="w-7 h-7 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer text-sm"
                      >
                        +
                      </button>
                    </div>

                    {/* Botón agregar */}
                    <button
                      onClick={() => handleAddToCart(variante)}
                      className="flex-1 sm:flex-none px-4 py-1.5 rounded text-xs font-medium transition-all cursor-pointer bg-[#4a6741] text-white hover:bg-[#3d5636]"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Mensaje si no está disponible */}
              {!variante.variante_disponible && (
                <p className="text-xs text-gray-500">No disponible</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
