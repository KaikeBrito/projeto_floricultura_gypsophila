import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryNav } from "@/components/CategoryNav";
import { ProductCard } from "@/components/ProductCard";
import { getCategoriaBySlug, getCategorias, getProdutos } from "@/lib/strapi";

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categorias = await getCategorias().catch(() => []);
  return categorias.map((categoria) => ({ slug: categoria.slug }));
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await getCategoriaBySlug(slug).catch(() => null);
  if (!categoria) return { title: "Categoria não encontrada" };
  return {
    title: categoria.seo?.metaTitle ?? categoria.nome,
    description: categoria.seo?.metaDescription ?? categoria.descricao ?? undefined,
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const { slug } = await params;
  const [categoria, produtos, categorias] = await Promise.all([
    getCategoriaBySlug(slug),
    getProdutos({ categoriaSlug: slug }).catch(() => []),
    getCategorias().catch(() => []),
  ]);

  if (!categoria) notFound();

  return (
    <>
      <header className="page-head">
        <h1>{categoria.nome}</h1>
        {categoria.descricao && <p>{categoria.descricao}</p>}
      </header>

      <CategoryNav categorias={categorias} ativa={slug} />

      {produtos.length === 0 ? (
        <p className="empty-state">Nenhum produto nesta categoria no momento.</p>
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
