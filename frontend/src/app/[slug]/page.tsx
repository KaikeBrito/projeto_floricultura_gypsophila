import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPaginaBySlug, getPaginas } from "@/lib/strapi";

interface PaginaPageProps {
  params: Promise<{ slug: string }>;
}

// Gera estaticamente as páginas institucionais existentes no Strapi.
export async function generateStaticParams() {
  const paginas = await getPaginas().catch(() => []);
  return paginas.map((pagina) => ({ slug: pagina.slug }));
}

export async function generateMetadata({ params }: PaginaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pagina = await getPaginaBySlug(slug).catch(() => null);
  if (!pagina) return {};
  return {
    title: pagina.seo?.metaTitle ?? pagina.titulo,
    description: pagina.seo?.metaDescription ?? undefined,
  };
}

export default async function PaginaInstitucional({ params }: PaginaPageProps) {
  const { slug } = await params;
  const pagina = await getPaginaBySlug(slug).catch(() => null);

  if (!pagina) notFound();

  return (
    <article className="prosa">
      <h1>{pagina.titulo}</h1>
      {/* conteudo é markdown (richtext). Aqui preservamos quebras de linha de forma simples.
          Para markdown completo (negrito, listas, links), adicione "react-markdown" depois. */}
      <div className="prosa__corpo" style={{ whiteSpace: "pre-line" }}>
        {pagina.conteudo}
      </div>
    </article>
  );
}
