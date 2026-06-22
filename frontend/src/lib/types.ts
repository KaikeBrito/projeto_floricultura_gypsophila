/** Tipos alinhados a docs/02-modelagem-dados.md */

export interface StrapiImage {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
}

export interface SeoComponent {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaImage?: StrapiImage | null;
}

export interface Categoria {
  id: number;
  nome: string;
  slug: string;
  descricao?: string | null;
  ordem?: number;
  seo?: SeoComponent | null;
}

export interface Produto {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  preco?: number | null;
  precoSobConsulta: boolean;
  imagemPrincipal: StrapiImage;
  galeria?: StrapiImage[] | null;
  disponivel: boolean;
  destaque: boolean;
  categoria?: Categoria | null;
  seo?: SeoComponent | null;
}

export interface Banner {
  id: number;
  titulo?: string | null;
  imagem: StrapiImage;
  linkDestino?: string | null;
  ativo: boolean;
  dataInicio?: string | null;
  dataFim?: string | null;
  ordem?: number;
}

export interface ConfiguracoesGerais {
  nomeFantasia: string;
  endereco: string;
  whatsappNumero: string;
  horarioFuncionamento: string;
  googleMapsEmbedUrl?: string | null;
  mensagemPadraoWhatsApp?: string | null;
  instagram?: string | null;
  facebook?: string | null;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T | null;
}
