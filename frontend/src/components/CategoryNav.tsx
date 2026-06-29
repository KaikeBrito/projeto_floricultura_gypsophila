import Link from "next/link";
import type { Categoria } from "@/lib/types";

interface CategoryNavProps {
  categorias: Categoria[];
  ativa?: string; // slug da categoria atual (para destacar)
}

/** Barra de navegação por categorias. Reutilizada no catálogo e nas páginas de categoria. */
export function CategoryNav({ categorias, ativa }: CategoryNavProps) {
  if (categorias.length === 0) return null;

  return (
    <nav className="category-nav" aria-label="Categorias">
      <Link
        href="/flores"
        className={`category-nav__item${!ativa ? " is-active" : ""}`}
      >
        Todos
      </Link>
      {categorias.map((categoria) => (
        <Link
          key={categoria.id}
          href={`/categoria/${categoria.slug}`}
          className={`category-nav__item${ativa === categoria.slug ? " is-active" : ""}`}
        >
          {categoria.nome}
        </Link>
      ))}
    </nav>
  );
}
