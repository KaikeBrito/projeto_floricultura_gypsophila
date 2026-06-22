import type { Metadata } from "next";
import { getConfiguracoes } from "@/lib/strapi";
import { LocalBusinessSchema } from "@/components/LocalBusinessSchema";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gypsophila.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Floricultura Gypsophila",
    template: "%s | Floricultura Gypsophila",
  },
  description:
    "Floricultura tradicional em Fortaleza — buquês, arranjos, cestas e coroas. Entrega na Aldeota e região.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getConfiguracoes().catch(() => null);

  return (
    <html lang="pt-BR">
      <body>
        {config && <LocalBusinessSchema config={config} siteUrl={siteUrl} />}
        <header className="site-header">
          <div className="site-header__inner">
            <a href="/" className="site-header__brand">
              {config?.nomeFantasia ?? "Gypsophila"}
            </a>
          </div>
        </header>
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
