"use client";

import { useState } from "react";
import Image from "next/image";
import { optimizeImageUrl, imageSizes, getBlurDataUrl } from "@/lib/prismic";

interface ImagenData {
  imagen: {
    dimensions: {
      width: number;
      height: number;
    };
    alt: string | null;
    copyright: string | null;
    url: string;
    id: string;
    edit: {
      x: number;
      y: number;
      zoom: number;
      background: string;
    };
  };
}

interface ImageGalleryProps {
  imagenes: ImagenData[];
  nombre: string;
}

export default function ImageGallery({ imagenes, nombre }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = imagenes[selectedIndex]?.imagen;
  const totalImages = imagenes.length;

  // Optimize URLs for different sizes
  const mainImageUrl = selectedImage?.url
    ? optimizeImageUrl(selectedImage.url, imageSizes.productMain)
    : null;

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-square bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group">
        {mainImageUrl ? (
          <>
            <Image
              src={mainImageUrl}
              alt={selectedImage?.alt || nombre}
              fill
              className="object-contain p-6"
              sizes="(max-width: 768px) 100vw, 500px"
              priority={selectedIndex === 0}
              placeholder="blur"
              blurDataURL={getBlurDataUrl()}
            />

            {/* Navigation Arrows */}
            {totalImages > 1 && (
              <>
                {/* Previous Arrow */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[#4a6741] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Imagen anterior"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Next Arrow */}
                <button
                  onClick={goToNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-[#4a6741] transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                  aria-label="Imagen siguiente"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl text-gray-300">
            🫙
          </div>
        )}
      </div>

      {/* Thumbnail Gallery - Centered */}
      {totalImages > 1 && (
        <div className="flex flex-wrap justify-center gap-2">
          {imagenes.map((img, index) => {
            const thumbUrl = optimizeImageUrl(img.imagen.url, imageSizes.galleryThumb);
            return (
              <button
                key={`thumb-${index}`}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-16 h-16 bg-white rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${selectedIndex === index
                    ? "border-[#4a6741] shadow-md"
                    : "border-gray-200 hover:border-[#4a6741]/50"
                  }`}
              >
                <Image
                  src={thumbUrl}
                  alt={img.imagen.alt || `${nombre} ${index + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={getBlurDataUrl()}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
