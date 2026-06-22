# Floricultura Gypsophila

Site institucional e vitrine digital para a Floricultura Gypsophila (Aldeota, Fortaleza/CE).

Arquitetura **headless**: Strapi (CMS) + PostgreSQL no VPS, vitrine Next.js na CDN. Conversão via WhatsApp — sem checkout online no MVP.

## Mapa do repositório

```
floricultura-gypsophila/
├── README.md                    ← você está aqui
├── docs/                        ← documentação (ordem de leitura)
│   ├── 01-PRD.md
│   ├── 02-modelagem-dados.md
│   ├── 03-guia-milestone-1-infraestrutura.md
│   └── 04-guia-milestone-2-frontend.md
├── backend/                     ← CMS (Strapi) + infra Docker  [Milestone 1]
│   ├── README.md
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── nginx/gypsophila.conf
│   └── scripts/{backup.sh, restore.sh}
└── frontend/                    ← vitrine (Next.js)            [Milestone 2]
    ├── .env.local.example
    ├── next.config.mjs
    └── src/
        ├── lib/{strapi, types, whatsapp}.ts
        ├── components/{ProductCard, WhatsAppButton, LocalBusinessSchema}.tsx
        └── app/{layout, page, globals.css, produto/[slug]/page}
```

## Ordem de leitura

| # | Documento | Conteúdo |
|---|-----------|----------|
| 1 | [docs/01-PRD.md](docs/01-PRD.md) | Visão, escopo, requisitos e milestones |
| 2 | [docs/02-modelagem-dados.md](docs/02-modelagem-dados.md) | Content types do Strapi |
| 3 | [docs/03-guia-milestone-1-infraestrutura.md](docs/03-guia-milestone-1-infraestrutura.md) | Docker, Nginx, backups |
| 4 | [docs/04-guia-milestone-2-frontend.md](docs/04-guia-milestone-2-frontend.md) | Vitrine Next.js |

## Início rápido

### Backend (CMS)

```bash
cd backend
cp .env.example .env          # preencher segredos
docker compose up -d --build
```

Detalhes: [backend/README.md](backend/README.md)

### Frontend (vitrine)

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Detalhes: guia em [docs/04-guia-milestone-2-frontend.md](docs/04-guia-milestone-2-frontend.md)

## Milestones

| Milestone | Foco | Pasta principal |
|-----------|------|-----------------|
| 1 | Infra + CMS | `backend/` |
| 2 | Vitrine | `frontend/` |
| 3 | Conteúdo + SEO local | ambas |
| 4–6 | QA, deploy, handoff | — |

Status atual: infraestrutura documentada; Strapi inicializado; frontend em scaffold.
