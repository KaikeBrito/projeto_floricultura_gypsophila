import type { ConfiguracoesGerais } from "@/lib/types";

interface LocalBusinessSchemaProps {
  config: ConfiguracoesGerais;
  siteUrl: string;
}

/**
 * JSON-LD LocalBusiness / Florist para SEO local (RNF-020).
 * @see https://schema.org/Florist
 */
export function LocalBusinessSchema({ config, siteUrl }: LocalBusinessSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Florist",
    name: config.nomeFantasia,
    url: siteUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.endereco,
      addressLocality: "Fortaleza",
      addressRegion: "CE",
      addressCountry: "BR",
    },
    telephone: config.whatsappNumero,
    sameAs: [config.instagram, config.facebook].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
