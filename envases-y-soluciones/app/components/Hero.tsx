"use client";

import Image from "next/image";

export default function Hero() {
  const handleCatalogoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-[#faf8f6]">
      <div className="relative overflow-hidden max-w-7xl mx-auto">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.jpg"
            alt="Envases de vidrio"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        <div className="relative min-h-[350px] sm:min-h-[400px] lg:min-h-[448px] px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="max-w-xl">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                Envases de vidrio
                <br />
                <span className="text-[#4a6741]">y soluciones sostenibles</span>
              </h1>
              <p className="font-montserrat text-lg text-gray-600">
                Para tu marca, tu negocio y tus ideas
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleCatalogoClick}
                  className="font-montserrat bg-[#4a6741] text-white px-6 py-3 rounded-lg hover:bg-[#3d5636] transition-colors font-medium cursor-pointer"
                >
                  Ver catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
