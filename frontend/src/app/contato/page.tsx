import type { Metadata } from "next";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { getConfiguracoes } from "@/lib/strapi";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato e Localização",
  description:
    "Endereço, horário de funcionamento e WhatsApp da Floricultura Gypsophila, na Aldeota, Fortaleza/CE.",
};

export default async function ContatoPage() {
  const config = await getConfiguracoes().catch(() => null);

  const whatsappHref = config?.whatsappNumero
    ? buildWhatsAppUrl(config.whatsappNumero, config.mensagemPadraoWhatsApp)
    : null;

  return (
    <div className="contato">
      <header className="page-head">
        <h1>Contato e Localização</h1>
      </header>

      {config ? (
        <div className="contato__grid">
          <div className="contato__info">
            <p>
              <strong>Endereço</strong>
              <br />
              {config.endereco}
            </p>
            <p>
              <strong>Horário de funcionamento</strong>
              <br />
              {config.horarioFuncionamento}
            </p>
            {whatsappHref && <WhatsAppButton href={whatsappHref} label="Falar no WhatsApp" />}
          </div>

          {config.googleMapsEmbedUrl && (
            <div className="contato__mapa">
              <iframe
                src={config.googleMapsEmbedUrl}
                title="Localização no mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </div>
      ) : (
        <p className="empty-state">Dados de contato indisponíveis no momento.</p>
      )}
    </div>
  );
}
