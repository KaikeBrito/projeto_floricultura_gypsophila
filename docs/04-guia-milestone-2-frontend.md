# Guia Passo a Passo — Milestone 2: Front-end (Vitrine Next.js)
## Site Floricultura Gypsophila

| Campo | Valor |
|---|---|
| **Milestone** | 2 — Desenvolvimento do Front-end (Vitrine) |
| **Objetivo** | Home → Catálogo → Página de produto → WhatsApp, com SEO técnico desde o início |
| **Princípio guia** | KISS — componentes pequenos, dados do Strapi, sem lógica de negócio duplicada |
| **Pré-leitura** | [01-PRD.md](01-PRD.md), [02-modelagem-dados.md](02-modelagem-dados.md), Milestone 1 concluído |

> **Como usar este guia:** a vitrine está em `frontend/`. Cada arquivo abaixo corresponde a um artefato real do repositório. Leia na ordem: configuração → tipos → API → componentes → páginas.

---

## Passo 0 — O modelo mental

```
Visitante → Next.js (CDN) → API Strapi (build/revalidação)
                │
                └── deep link → WhatsApp (conversão RF-003)
```

O front-end **não acessa o PostgreSQL**. Toda leitura passa pela API REST do Strapi, preferencialmente em tempo de build ou com ISR (`revalidate`). Isso mantém performance (NFR-001) e reduz superfície de ataque.

---

## Pré-requisitos

1. **Milestone 1 feito:** Strapi rodando, content types criados conforme [02-modelagem-dados.md](02-modelagem-dados.md).
2. **Token de API read-only** no Strapi (Settings → API Tokens) — opcional em dev se permissões públicas estiverem abertas.
3. **Node.js 20+** instalado.

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Passo 1 — Configuração (`frontend/`)

| Arquivo | Função |
|---------|--------|
| `package.json` | Dependências Next.js 15 + React 19 |
| `tsconfig.json` | TypeScript strict, alias `@/*` → `src/*` |
| `next.config.mjs` | `remotePatterns` para imagens do Strapi |
| `.env.local.example` | `NEXT_PUBLIC_STRAPI_URL`, `STRAPI_API_TOKEN` |
| `.gitignore` | Ignora `.next`, `node_modules`, `.env*.local` |

**Variáveis de ambiente:**

- `NEXT_PUBLIC_STRAPI_URL` — URL pública do CMS (ex.: `http://localhost:1337` em dev).
- `STRAPI_API_TOKEN` — token Bearer para rotas que exigem autenticação (server-side only).
- `NEXT_PUBLIC_SITE_URL` — URL canônica do site (SEO / schema), opcional no layout.

---

## Passo 2 — Tipos (`src/lib/types.ts`)

Interfaces TypeScript espelhando os content types do Strapi: `Produto`, `Categoria`, `Banner`, `ConfiguracoesGerais`, `SeoComponent`.

Mantém o front-end alinhado ao documento de modelagem — qualquer campo novo no CMS deve refletir aqui.

---

## Passo 3 — Cliente Strapi (`src/lib/strapi.ts`)

Funções de fetch com ISR padrão (`revalidate: 60`):

| Função | Endpoint | Uso |
|--------|----------|-----|
| `getProdutos()` | `/api/produtos` | Home, catálogo |
| `getProdutoBySlug(slug)` | `/api/produtos?filters[slug]` | Página de produto |
| `getCategorias()` | `/api/categorias` | Navegação futura |
| `getBannersAtivos()` | `/api/banners` | Hero sazonal |
| `getConfiguracoes()` | `/api/configuracoes-gerais` | NAP, WhatsApp, schema |
| `getStrapiMediaUrl(path)` | — | URL absoluta de uploads |

> **Strapi 5:** a API retorna objetos planos (sem wrapper `attributes`). Os tipos já consideram esse formato.

---

## Passo 4 — WhatsApp (`src/lib/whatsapp.ts`)

| Função | RF |
|--------|-----|
| `buildWhatsAppUrl(numero, mensagem)` | RF-003 — deep link |
| `buildProdutoWhatsAppMessage(nome, template)` | RF-003 — template com `{{produto}}` |
| `formatPreco(valor)` | RF-002 — exibição em BRL |

O número **nunca** é hardcoded: vem de `Configurações Gerais.whatsappNumero`.

---

## Passo 5 — Componentes (`src/components/`)

| Componente | Responsabilidade |
|------------|------------------|
| `ProductCard.tsx` | Card de vitrine com link `/produto/[slug]` |
| `WhatsAppButton.tsx` | Botão verde, `target="_blank"`, acessível |
| `LocalBusinessSchema.tsx` | JSON-LD `Florist` para SEO local (RNF-020) |

---

## Passo 6 — App Router (`src/app/`)

| Arquivo | Rota | Conteúdo |
|---------|------|----------|
| `layout.tsx` | — | Header, metadata global, schema LocalBusiness |
| `page.tsx` | `/` | Hero + grid de destaques |
| `globals.css` | — | Estilos base mobile-first |
| `produto/[slug]/page.tsx` | `/produto/:slug` | Detalhe + botão WhatsApp do produto |

`generateMetadata` na página de produto usa campos `seo` do CMS quando disponíveis.

---

## Passo 7 — Permissões no Strapi

Em **Settings → Users & Permissions → Roles → Public**, habilitar `find` / `findOne` para:

- `produto`, `categoria`, `banner`, `configuracoes-gerais`, `pagina-institucional`

`Solicitação de Orçamento`: apenas `create` (formulário futuro).

---

## Checklist de conclusão (Definition of Done)

- [ ] Home lista produtos em destaque com dados reais do Strapi
- [ ] `/produto/[slug]` exibe imagem, preço/sob consulta e descrição
- [ ] Botão WhatsApp abre com mensagem pré-preenchida (produto e global)
- [ ] `LocalBusinessSchema` válido (testar em [Rich Results Test](https://search.google.com/test/rich-results))
- [ ] Imagens do Strapi carregam via `next/image`
- [ ] Lighthouse mobile ≥ 90 na Home (após conteúdo real)

Cumprido isso, o Milestone 2 está fechado.

---

## Próximo passo

**Milestone 3 — Painel, Conteúdo e SEO Local:** cadastro do catálogo real pelo lojista, Google Business Profile, sitemap e validação de rich results.

---

*Fim do Guia — Milestone 2, v1.0.*
