"use client";

import { useCart, CartItem, getCartItemId } from "@/app/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalItems } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = item.discountPrice || item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  useEffect(() => {
    if (isCartOpen) {
      setIsAnimating(true);
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      // Small delay to allow the component to mount before animating
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      // Re-enable body scroll when sidebar closes
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen]);

  if (!isCartOpen && !isAnimating) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-60 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white z-70 shadow-xl z-50 flex flex-col transition-transform duration-300 ease-out rounded-l-2xl ${isVisible ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-playfair text-xl font-bold text-gray-800">
            Mi Cotización ({totalItems})
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-16 h-16 mx-auto text-gray-300 mb-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <p className="text-gray-500">Tu cotización está vacía</p>
              <p className="text-gray-400 text-sm mt-2">
                Agrega productos para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const itemId = getCartItemId(item.variantCode, item.selectedLidColor);
                return (
                  <CartItemCard
                    key={itemId}
                    item={item}
                    onRemove={() => removeItem(itemId)}
                    onUpdateQuantity={(qty) => updateQuantity(itemId, qty)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-4 space-y-4">
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-montserrat text-gray-600">Total estimado:</span>
              <span className="font-playfair text-xl font-bold text-[#4a6741]">₡{totalPrice.toLocaleString()}</span>
            </div>
            <Link
              href="/cotizacion"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-[#4a6741] text-white text-center py-3 px-6 rounded-xl hover:bg-[#3d5636] transition-colors font-medium"
            >
              Continuar con la cotización
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

function CartItemCard({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex gap-4">
        {/* Image */}
        <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
          {item.productImage ? (
            <Image
              src={item.productImage}
              alt={item.productName}
              fill
              className="object-contain p-1"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-300">
              🫙
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-800 truncate">{item.productName}</h3>
              <p className="text-sm text-gray-500">Código: {item.variantCode}</p>
            </div>
            {/* Remove button */}
            <button
              onClick={onRemove}
              className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 cursor-pointer"
              aria-label="Eliminar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
          
          <p className="text-sm text-gray-500">
            {item.capacity}ml • {item.height}cm × {item.diameter}cm
          </p>

          {/* Lid Color Display (read-only) */}
          {item.selectedLidColor && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Tapa:</span> {item.selectedLidColor}
            </p>
          )}

          {/* Quantity and Price Row */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 cursor-pointer"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 cursor-pointer"
              >
                +
              </button>
            </div>
            
            {/* Price on right */}
            <div className="text-right">
              <span className="font-bold text-[#4a6741]">
                ₡{((item.discountPrice || item.price) * item.quantity).toLocaleString()}
              </span>
              {item.quantity > 1 && (
                <p className="text-xs text-gray-400">
                  ₡{(item.discountPrice || item.price).toLocaleString()} c/u
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
