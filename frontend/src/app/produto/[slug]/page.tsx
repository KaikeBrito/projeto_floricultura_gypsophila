import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getConfiguracoes, getProdutoBySlug, getStrapiMediaUrl } from "@/lib/strapi";
import {
  buildProdutoWhatsAppMessage,
  buildWhatsAppUrl,
  formatPreco,
} from "@/lib/whatsapp";

interface ProdutoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProdutoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProdutoBySlug(slug).catch(() => null);

  if (!produto) {
    return { title: "Produto não encontrado" };
  }

  const title = produto.seo?.metaTitle ?? produto.nome;
  const description =
    produto.seo?.metaDescription ?? produto.descricao.slice(0, 160);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: produto.imagemPrincipal?.url
        ? [getStrapiMediaUrl(produto.imagemPrincipal.url)]
        : undefined,
    },
  };
}

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug } = await params;
  const [produto, config] = await Promise.all([
    getProdutoBySlug(slug),
    getConfiguracoes().catch(() => null),
  ]);

  if (!produto) {
    notFound();
  }

  const imagemUrl = getStrapiMediaUrl(produto.imagemPrincipal.url);
  const precoLabel = produto.precoSobConsulta
    ? "Sob consulta"
    : produto.preco != null
      ? formatPreco(produto.preco)
      : "Sob consulta";

  const whatsappHref =
    config?.whatsappNumero
      ? buildWhatsAppUrl(
          config.whatsappNumero,
          buildProdutoWhatsAppMessage(produto.nome, config.mensagemPadraoWhatsApp)
        )
      : null;

  return (
    <article className="produto-detalhe">
      <Image
        src={imagemUrl}
        alt={produto.imagemPrincipal.alternativeText ?? produto.nome}
        width={720}
        height={720}
        className="produto-detalhe__image"
        priority
        sizes="(max-width: 768px) 100vw, 720px"
      />
      {produto.categoria && (
        <p className="product-card__category">{produto.categoria.nome}</p>
      )}
      <h1>{produto.nome}</h1>
      <p className="produto-detalhe__preco">{precoLabel}</p>
      <div className="produto-detalhe__descricao">{produto.descricao}</div>
      {whatsappHref && produto.disponivel && (
        <WhatsAppButton href={whatsappHref} label="Pedir este produto pelo WhatsApp" />
      )}
      {!produto.disponivel && (
        <p className="product-card__badge">Produto temporariamente indisponível</p>
      )}
    </article>
  );
}
