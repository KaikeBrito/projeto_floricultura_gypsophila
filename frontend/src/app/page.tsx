import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getConfiguracoes, getProdutos } from "@/lib/strapi";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export default async function HomePage() {
  const [produtos, config] = await Promise.all([
    getProdutos({ destaque: true }).catch(() => []),
    getConfiguracoes().catch(() => null),
  ]);

  const whatsappGlobal =
    config?.whatsappNumero
      ? buildWhatsAppUrl(
          config.whatsappNumero,
          config.mensagemPadraoWhatsApp ?? "Olá! Vim pelo site e gostaria de mais informações."
        )
      : null;

  return (
    <>
      <section className="hero">
        <h1>Flores para cada momento</h1>
        <p>Buquês, arranjos e presentes florais — Aldeota, Fortaleza</p>
        {whatsappGlobal && (
          <p style={{ marginTop: "1.5rem" }}>
            <WhatsAppButton href={whatsappGlobal} />
          </p>
        )}
      </section>

      <section>
        <h2>Destaques</h2>
        {produtos.length === 0 ? (
          <p className="empty-state">
            Nenhum produto em destaque. Cadastre itens no painel Strapi com &quot;destaque&quot;
            ativo.
          </p>
        ) : (
          <div className="product-grid">
            {produtos.map((produto) => (
              <ProductCard key={produto.id} produto={produto} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
