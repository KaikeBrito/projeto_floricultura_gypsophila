import type { Metadata } from "next";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCard } from "@/components/ProductCard";
import { getCategorias, getProdutos } from "@/lib/strapi";

export const metadata: Metadata = {
  title: "Flores e Arranjos",
  description:
    "Buquês, arranjos, cestas e coroas da Floricultura Gypsophila. Escolha e finalize o pedido pelo WhatsApp.",
};

export default async function CatalogoPage() {
  const [produtos, categorias] = await Promise.all([
    getProdutos().catch(() => []),
    getCategorias().catch(() => []),
  ]);

  return (
    <>
      <header className="page-head">
        <h1>Flores e Arranjos</h1>
        <p>Escolha um arranjo e finalize o pedido pelo WhatsApp.</p>
      </header>

      <CategoryNav categorias={categorias} />

      {produtos.length === 0 ? (
        <p className="empty-state">Nenhum produto disponível no momento.</p>
      ) : (
        <div className="product-grid">
          {produtos.map((produto) => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
        </div>
      )}
    </>
  );
}
