import * as prismic from "@prismicio/client";
import { unstable_cache } from "next/cache";

export const repositoryName = "envases-y-soluciones";

export const client = prismic.createClient(repositoryName, {
  accessToken: undefined,
});

// Helper to extract text from Prismic RichText or plain text
export function extractText(field: unknown): string {
  if (typeof field === 'string') {
    return field;
  }
  if (Array.isArray(field)) {
    return field.map((block: { text?: string }) => block?.text || '').join(' ');
  }
  if (field && typeof field === 'object' && 'text' in field) {
    return (field as { text: string }).text;
  }
  return '';
}

// Image optimization helper using Prismic/Imgix URL parameters
// This reduces bandwidth usage and improves performance
interface ImageOptimizeOptions {
  width?: number;
  height?: number;
  quality?: number;
  fit?: 'crop' | 'clip' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale';
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
}

export function optimizeImageUrl(url: string, options: ImageOptimizeOptions = {}): string {
  if (!url) return url;

  const {
    width,
    height,
    quality = 75,
    fit = 'max',
    format = 'auto',
  } = options;

  // Parse existing URL
  const urlObj = new URL(url);

  // Add Imgix parameters for optimization
  if (width) urlObj.searchParams.set('w', width.toString());
  if (height) urlObj.searchParams.set('h', height.toString());
  urlObj.searchParams.set('q', quality.toString());
  urlObj.searchParams.set('fit', fit);
  urlObj.searchParams.set('fm', format);

  // Enable auto format and compression
  urlObj.searchParams.set('auto', 'format,compress');

  return urlObj.toString();
}

// Predefined image sizes for different contexts - OPTIMIZED for bandwidth
export const imageSizes = {
  // Product card thumbnail (smaller for catalog grid)
  thumbnail: { width: 280, height: 280, quality: 65 },
  // Gallery thumbnails (very small)
  galleryThumb: { width: 80, height: 80, quality: 50 },
  // Cart/Cotizacion thumbnails (very small)
  cartThumb: { width: 80, height: 80, quality: 50 },
  // Main product image (medium quality for detail page)
  productMain: { width: 500, height: 500, quality: 75 },
  // Large product image (for zoom/modal) - only load when needed
  productLarge: { width: 800, height: 800, quality: 80 },
};

// Generate blur data URL for placeholder (tiny base64 image)
export function getBlurDataUrl(): string {
  // A simple gray placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
}

// Types for Prismic data
export interface Variante {
  codigo: string;
  altura: number;
  diametro: number;
  capacidad: number;
  precio: number;
  descuento: boolean;
  precio_con_descuento: number | null;
  variante_disponible: boolean;
}

export interface LinkedDocument {
  id: string;
  type: string;
  tags: string[];
  lang: string;
  slug: string;
  first_publication_date: string;
  last_publication_date: string;
  link_type: string;
  key: string;
  isBroken: boolean;
}

export interface Imagen {
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

export interface ProductoData {
  nombre: string;
  variantes: Variante[];
  descripcion: {
    type: string;
    text: string;
    spans: unknown[];
    direction: string;
  }[];
  categorias: { categoria: LinkedDocument }[];
  colores: { color: LinkedDocument }[];
  colores_de_tapa: { color_de_tapa: LinkedDocument }[];
  imagenes: Imagen[];
  materiales: { material: LinkedDocument }[];
  producto_disponible: boolean;
}

export interface Producto {
  id: string;
  uid: string;
  url: string | null;
  type: string;
  href: string;
  tags: string[];
  first_publication_date: string;
  last_publication_date: string;
  slugs: string[];
  linked_documents: unknown[];
  lang: string;
  alternate_languages: unknown[];
  data: ProductoData;
}

export async function getAllProductos(): Promise<Producto[]> {
  const response = await client.getAllByType("producto");
  return response as unknown as Producto[];
}

export async function getProductoByUID(uid: string): Promise<Producto | null> {
  try {
    const response = await client.getByUID("producto", uid);
    return response as unknown as Producto;
  } catch {
    return null;
  }
}

export async function getAllCategorias() {
  const response = await client.getAllByType("categoria");
  return response;
}

export async function getAllMateriales() {
  const response = await client.getAllByType("material");
  return response;
}

export async function getAllColores() {
  const response = await client.getAllByType("color");
  return response;
}

export const REVALIDATE_TIME = 3600; // 1 hour

// Cached version of getHomePageData - reduces API calls significantly
// Data is cached for 1 hour and shared across all pages
export const getHomePageData = unstable_cache(
  async () => {
    const [productos, categorias, materiales, colores] = await Promise.all([
      getAllProductos(),
      getAllCategorias(),
      getAllMateriales(),
      getAllColores(),
    ]);
    return { productos, categorias, materiales, colores };
  },
  ["home-page-data"],
  { revalidate: REVALIDATE_TIME, tags: ["prismic-data"] }
);

// Cached version for single product - also shared cache
export const getCachedProductoByUID = unstable_cache(
  async (uid: string) => {
    return getProductoByUID(uid);
  },
  ["producto"],
  { revalidate: REVALIDATE_TIME, tags: ["prismic-data"] }
);
