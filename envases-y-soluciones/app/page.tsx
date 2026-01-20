import Header from "./components/Header";
import Hero from "./components/Hero";
import Features from "./components/Features";
import ProductCatalog from "./components/ProductCatalog";
import Footer from "./components/Footer";
import {
  getHomePageData,
  extractText,
  REVALIDATE_TIME,
} from "@/lib/prismic";

// ISR - revalidate page every hour
export const revalidate = REVALIDATE_TIME;

interface PrismicDocument {
  id: string;
  uid?: string;
  slugs?: string[];
  data?: {
    nombre?: unknown;
  };
}

export default async function Home() {
  // Fetch all data from Prismic in a single cached call
  const { productos, categorias: categoriasData, materiales: materialesData, colores: coloresData } =
    await getHomePageData();

  // Transform filter data
  const categorias = (categoriasData as PrismicDocument[]).map((cat) => ({
    id: cat.id,
    slug: cat.uid || cat.slugs?.[0] || "",
    name: extractText(cat.data?.nombre) || cat.uid || cat.slugs?.[0] || "",
  }));

  const materiales = (materialesData as PrismicDocument[]).map((mat) => ({
    id: mat.id,
    slug: mat.uid || mat.slugs?.[0] || "",
    name: extractText(mat.data?.nombre) || mat.uid || mat.slugs?.[0] || "",
  }));

  const colores = (coloresData as PrismicDocument[]).map((col) => ({
    id: col.id,
    slug: col.uid || col.slugs?.[0] || "",
    name: extractText(col.data?.nombre) || col.uid || col.slugs?.[0] || "",
  }));

  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <ProductCatalog
        productos={productos}
        categorias={categorias}
        materiales={materiales}
        colores={colores}
      />
      <Footer />
    </main>
  );
}
