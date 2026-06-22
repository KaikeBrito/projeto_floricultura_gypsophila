import Image from "next/image";
import Link from "next/link";
import type { Produto } from "@/lib/types";
import { getStrapiMediaUrl } from "@/lib/strapi";
import { formatPreco } from "@/lib/whatsapp";

interface ProductCardProps {
  produto: Produto;
}

export function ProductCard({ produto }: ProductCardProps) {
  const imagemUrl = getStrapiMediaUrl(produto.imagemPrincipal.url);
  const precoLabel = produto.precoSobConsulta
    ? "Sob consulta"
    : produto.preco != null
      ? formatPreco(produto.preco)
      : "Sob consulta";

  return (
    <article className="product-card">
      <Link href={`/produto/${produto.slug}`} className="product-card__link">
        <div className="product-card__image-wrap">
          <Image
            src={imagemUrl}
            alt={produto.imagemPrincipal.alternativeText ?? produto.nome}
            width={400}
            height={400}
            className="product-card__image"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
        <div className="product-card__body">
          {produto.categoria && (
            <span className="product-card__category">{produto.categoria.nome}</span>
          )}
          <h3 className="product-card__title">{produto.nome}</h3>
          <p className="product-card__price">{precoLabel}</p>
          {!produto.disponivel && (
            <span className="product-card__badge">Indisponível</span>
          )}
        </div>
      </Link>
    </article>
  );
}
