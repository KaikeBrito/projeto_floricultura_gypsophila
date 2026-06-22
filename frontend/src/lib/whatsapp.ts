/**
 * Monta deep link WhatsApp (RF-003).
 * Número em formato internacional, sem + ou espaços (ex.: 5585XXXXXXXXX).
 */
export function buildWhatsAppUrl(
  numero: string,
  mensagem?: string | null
): string {
  const digits = numero.replace(/\D/g, "");
  const text = mensagem?.trim() ?? "";
  const params = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${params}`;
}

export function buildProdutoWhatsAppMessage(
  produtoNome: string,
  template?: string | null
): string {
  const defaultTemplate = "Olá! Gostaria de pedir: {{produto}}";
  const base = template?.trim() || defaultTemplate;
  return base.replace(/\{\{produto\}\}/gi, produtoNome);
}

export function formatPreco(preco: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(preco);
}
