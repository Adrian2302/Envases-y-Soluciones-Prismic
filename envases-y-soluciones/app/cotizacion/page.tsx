"use client";

import { useState } from "react";
import { useCart, getCartItemId } from "@/app/context/CartContext";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import Image from "next/image";
import Link from "next/link";

interface FormData {
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  preferenciaContacto: "whatsapp" | "correo";
}

export default function CotizacionPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellidos: "",
    email: "",
    telefono: "",
    preferenciaContacto: "whatsapp",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate total price
  const totalPrice = items.reduce((sum, item) => {
    const itemPrice = item.discountPrice || item.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      setErrorMessage("Agrega al menos un producto a tu cotización");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/cotizacion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cliente: formData,
          productos: items,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la cotización");
      }

      setSubmitStatus("success");
      clearCart();
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus("error");
      setErrorMessage("Hubo un error al enviar la cotización. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-10 h-10 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h1 className="font-playfair text-2xl font-bold text-gray-800 mb-4">
                ¡Cotización enviada exitosamente!
              </h1>
              <p className="font-montserrat text-gray-600 mb-8">
                Hemos recibido tu solicitud de cotización. Te contactaremos pronto por{" "}
                {formData.preferenciaContacto === "whatsapp" ? "WhatsApp" : "correo electrónico"}.
              </p>
              <Link
                href="/"
                className="font-montserrat inline-flex items-center gap-2 bg-[#4a6741] text-white px-6 py-3 rounded-xl hover:bg-[#3d5636] transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#4a6741]">
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="font-montserrat text-gray-800 font-medium">Mi Cotización</li>
          </ol>
        </nav>

        <h1 className="font-playfair text-3xl font-bold text-gray-800 mb-8">Mi Cotización</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-20 h-20 mx-auto text-gray-300 mb-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
            <h2 className="font-playfair text-xl font-semibold text-gray-800 mb-2">
              Tu cotización está vacía
            </h2>
            <p className="font-montserrat text-gray-500 mb-6">
              Agrega productos desde nuestro catálogo para comenzar tu cotización.
            </p>
            <Link
              href="/#catalogo"
              className="font-montserrat inline-flex items-center gap-2 bg-[#4a6741] text-white px-6 py-3 rounded-xl hover:bg-[#3d5636] transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Products List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-playfair text-lg font-semibold text-gray-800">
                    Productos ({items.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const itemId = getCartItemId(item.variantCode, item.selectedLidColor);
                    return (
                      <div key={itemId} className="p-6">
                        <div className="flex gap-4">
                          {/* Image */}
                          <div className="relative w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                fill
                                className="object-contain p-1"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">
                                🫙
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-montserrat font-medium text-gray-800 mb-1">
                                  {item.productName}
                                </h3>
                                <p className="font-montserrat text-sm text-gray-500 mb-1">
                                  Código: {item.variantCode}
                                </p>
                              </div>
                              {/* Remove button */}
                              <button
                                onClick={() => removeItem(itemId)}
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

                            <p className="text-sm text-gray-500 mb-2">
                              {item.capacity}ml • {item.height}cm × {item.diameter}cm
                            </p>

                            {/* Lid Color Display (read-only) */}
                            {item.selectedLidColor && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Color de tapa:</span> {item.selectedLidColor}
                              </p>
                            )}

                            {/* Quantity and Price Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-600">Cantidad:</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      updateQuantity(itemId, item.quantity - 1)
                                    }
                                    className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) =>
                                      updateQuantity(
                                        itemId,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="w-16 text-center border rounded py-1 text-sm"
                                  />
                                  <button
                                    onClick={() =>
                                      updateQuantity(itemId, item.quantity + 1)
                                    }
                                    className="w-8 h-8 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Price on right */}
                              <div className="text-right">
                                <span className="font-bold text-lg text-[#4a6741]">
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
                  })}
                </div>

                {/* Total */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-montserrat text-lg text-gray-700">Total estimado:</span>
                    <span className="font-playfair text-2xl font-bold text-[#4a6741]">₡{totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">*Los precios pueden variar según disponibilidad</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h2 className="font-playfair text-lg font-semibold text-gray-800 mb-6">
                  Información de contacto
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="nombre"
                      className="font-montserrat block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4a6741] focus:border-transparent outline-none"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="apellidos"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Apellidos *
                    </label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      required
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4a6741] focus:border-transparent outline-none"
                      placeholder="Tus apellidos"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4a6741] focus:border-transparent outline-none"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="telefono"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Número de teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#4a6741] focus:border-transparent outline-none"
                      placeholder="+506 8888-8888"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ¿Cómo prefieres ser contactado? *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="preferenciaContacto"
                          value="whatsapp"
                          checked={formData.preferenciaContacto === "whatsapp"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#4a6741] focus:ring-[#4a6741]"
                        />
                        <span className="text-sm text-gray-700">WhatsApp</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="preferenciaContacto"
                          value="correo"
                          checked={formData.preferenciaContacto === "correo"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-[#4a6741] focus:ring-[#4a6741]"
                        />
                        <span className="text-sm text-gray-700">Correo</span>
                      </label>
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="font-montserrat w-full bg-[#4a6741] text-white py-3 px-6 rounded-xl hover:bg-[#3d5636] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar Cotización"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
