import type {
  Banner,
  Categoria,
  ConfiguracoesGerais,
  Produto,
  StrapiListResponse,
  StrapiSingleResponse,
} from "./types";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";
const API_TOKEN = process.env.STRAPI_API_TOKEN;

type FetchOptions = {
  revalidate?: number | false;
};

async function strapiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (API_TOKEN) {
    headers.Authorization = `Bearer ${API_TOKEN}`;
  }

  const res = await fetch(`${STRAPI_URL}/api${path}`, {
    headers,
    next: options.revalidate === false ? undefined : { revalidate: options.revalidate ?? 60 },
  });

  if (!res.ok) {
    throw new Error(`Strapi ${path}: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/** URL absoluta para mídia hospedada no Strapi */
export function getStrapiMediaUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${STRAPI_URL}${path}`;
}

export async function getProdutos(params?: {
  destaque?: boolean;
  categoriaSlug?: string;
}): Promise<Produto[]> {
  const filters: string[] = ["filters[disponivel][$eq]=true"];

  if (params?.destaque) {
    filters.push("filters[destaque][$eq]=true");
  }
  if (params?.categoriaSlug) {
    filters.push(`filters[categoria][slug][$eq]=${encodeURIComponent(params.categoriaSlug)}`);
  }

  const query = [
    ...filters,
    "populate[imagemPrincipal]=*",
    "populate[categoria]=*",
    "sort=nome:asc",
  ].join("&");

  const json = await strapiFetch<StrapiListResponse<Produto>>(`/produtos?${query}`);
  return json.data ?? [];
}

export async function getProdutoBySlug(slug: string): Promise<Produto | null> {
  const query = [
    `filters[slug][$eq]=${encodeURIComponent(slug)}`,
    "populate[imagemPrincipal]=*",
    "populate[galeria]=*",
    "populate[categoria]=*",
    "populate[seo][populate]=metaImage",
  ].join("&");

  const json = await strapiFetch<StrapiListResponse<Produto>>(`/produtos?${query}`);
  return json.data?.[0] ?? null;
}

export async function getCategorias(): Promise<Categoria[]> {
  const json = await strapiFetch<StrapiListResponse<Categoria>>(
    "/categorias?sort=ordem:asc"
  );
  return json.data ?? [];
}

export async function getBannersAtivos(): Promise<Banner[]> {
  const today = new Date().toISOString().split("T")[0];
  const query = [
    "filters[ativo][$eq]=true",
    `filters[dataInicio][$lte]=${today}`,
    `filters[dataFim][$gte]=${today}`,
    "populate[imagem]=*",
    "sort=ordem:asc",
  ].join("&");

  const json = await strapiFetch<StrapiListResponse<Banner>>(`/banners?${query}`);
  return json.data ?? [];
}

export async function getConfiguracoes(): Promise<ConfiguracoesGerais | null> {
  const json = await strapiFetch<StrapiSingleResponse<ConfiguracoesGerais>>(
    "/configuracoes-gerais"
  );
  return json.data ?? null;
}
