import type { Metadata } from "next";
import Link from "next/link";
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
}: Readonly<{ children: React.ReactNode }>) {
  const config = await getConfiguracoes().catch(() => null);

  return (
    <html lang="pt-BR">
      <body>
        {config && <LocalBusinessSchema config={config} siteUrl={siteUrl} />}

        <header className="site-header">
          <div className="site-header__inner">
            <Link href="/" className="site-header__brand">
              {config?.nomeFantasia ?? "Gypsophila"}
            </Link>
            <nav className="site-nav" aria-label="Navegação principal">
              <Link href="/flores" className="site-nav__link">Flores</Link>
              <Link href="/eventos" className="site-nav__link">Eventos</Link>
              <Link href="/sobre" className="site-nav__link">Sobre</Link>
              <Link href="/contato" className="site-nav__link">Contato</Link>
            </nav>
          </div>
        </header>

        <main className="site-main">{children}</main>

        <footer className="site-footer">
          <div className="site-footer__inner">
            <p>{config?.nomeFantasia ?? "Floricultura Gypsophila"}</p>
            {config?.endereco && <p>{config.endereco}</p>}
            {config?.horarioFuncionamento && <p>{config.horarioFuncionamento}</p>}
            {config?.instagram && (
              <a href={config.instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            )}
          </div>
        </footer>
      </body>
    </html>
  );
}
