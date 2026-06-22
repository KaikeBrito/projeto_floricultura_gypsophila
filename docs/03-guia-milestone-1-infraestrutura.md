# Guia Passo a Passo — Milestone 1: Setup Técnico e Infraestrutura
## Site Floricultura Gypsophila

| Campo | Valor |
|---|---|
| **Milestone** | 1 — Setup Técnico e Infraestrutura |
| **Objetivo** | Subir PostgreSQL + Strapi + Nginx, de forma segura e reproduzível |
| **Princípio guia** | KISS — *Keep It Simple, Stupid*: tudo direto, legível e sem complexidade desnecessária |
| **Pré-leitura** | PRD v1.0 e documento de Modelagem de Dados |

> **Como usar este guia:** leia na ordem, de cima para baixo. Cada passo explica *o que* é o arquivo, *o que cada parte faz* e *por que* ela existe. Você não precisa decorar nada — a ideia é que, ao terminar, você consiga olhar qualquer linha e saber o que ela faz.

---

## Glossário rápido (leia se algum termo for novo)

Quatro palavras que aparecem o tempo todo. Em uma frase cada:

- **Imagem (image):** um "molde" congelado de um programa pronto para rodar (ex.: o Postgres já instalado).
- **Container:** uma instância viva desse molde rodando na sua máquina. A imagem é a receita; o container é o bolo.
- **Volume:** uma "gaveta" no disco que fica *fora* do container, para os dados não sumirem quando o container é recriado.
- **Rede (network):** um "corredor" privado por onde os containers conversam entre si.

Guarde isso. O resto do guia só combina essas quatro peças.

---

## Passo 0 — O modelo mental (entenda isto e o resto fica fácil)

Pense na nossa stack como uma **loja física com três funcionários**:

```
        INTERNET
           │
           ▼
   ┌───────────────┐
   │     NGINX     │   ← o PORTEIRO. É o único com porta para a rua.
   │ (porta 80/443)│     Fala HTTPS, confere o crachá (rate limit) e
   └───────┬───────┘     encaminha quem chega para o atendente.
           │  (rede "frontend")
           ▼
   ┌───────────────┐
   │    STRAPI     │   ← o ATENDENTE + painel de gestão. Recebe pedidos,
   │  (CMS, :1337) │     busca as coisas no almoxarifado e responde.
   └───────┬───────┘
           │  (rede "backend" — corredor interno, SEM saída para a rua)
           ▼
   ┌───────────────┐
   │   POSTGRES    │   ← o ALMOXARIFADO. Guarda tudo, fica nos fundos.
   │ (banco, :5432)│     Não tem porta para a rua: ninguém de fora o acessa.
   └───────────────┘
```

A ideia central de segurança está nos **dois corredores (redes)**: o almoxarifado (banco) só conversa pelo corredor interno, que não tem saída para a rua. Mesmo que alguém invada a recepção, não chega ao estoque diretamente. Guarde essa imagem — é ela que o `docker-compose.yml` descreve.

---

## Pré-requisitos (antes de qualquer comando)

1. **Docker + Docker Compose v2** instalados na máquina (local para testar, depois no VPS).
2. **O projeto Strapi já está em `backend/`** (Strapi 5 + PostgreSQL). Se precisar recriar do zero:
   ```bash
   cd backend
   npx create-strapi-app@latest . --typescript
   ```
   Selecione **PostgreSQL** quando perguntado.
3. Os artefatos de infra já estão em `backend/`: `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `nginx/` e `scripts/`.

---

## Passo 1 — `docker-compose.yml` (a planta da loja)

Este é o arquivo mais importante. Ele declara os três funcionários (*services*) e os dois corredores (*networks*). É a tradução literal do desenho do Passo 0.

### 1.1 O almoxarifado (`postgres`)
```yaml
postgres:
  image: postgres:16-alpine     # usa uma imagem pronta do Postgres (leve, "alpine")
  restart: unless-stopped        # se cair, sobe sozinho de novo
  # repare: NÃO existe "ports:" aqui — de propósito.
  environment:                   # nome do banco, usuário e senha vêm do .env
    POSTGRES_DB: ${DATABASE_NAME}
    POSTGRES_USER: ${DATABASE_USERNAME}
    POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
  volumes:
    - postgres-data:/var/lib/postgresql/data   # os dados moram FORA do container
  networks:
    - backend                    # só no corredor interno
```
**O detalhe que mais importa:** não há `ports:`. Sem essa linha, o banco não tem "porta para a rua" — ninguém da internet o alcança. O `volume` é o que faz os dados sobreviverem: se o container for destruído e recriado, o estoque continua intacto na gaveta `postgres-data`.

### 1.2 O atendente (`strapi`)
```yaml
strapi:
  build:
    dockerfile: Dockerfile       # não usa imagem pronta: nós construímos a nossa (ver Passo 2)
  env_file: .env                 # carrega todos os segredos de uma vez
  environment:
    DATABASE_HOST: postgres      # "postgres" é o NOME do funcionário ao lado
  volumes:
    - strapi-uploads:/opt/app/public/uploads   # as fotos dos produtos persistem
  networks:
    - backend                    # fala com o almoxarifado
    - frontend                   # é ouvido pelo porteiro
  depends_on:
    postgres:
      condition: service_healthy # só sobe DEPOIS que o banco está saudável
```
Repare que o Strapi está nos **dois corredores** — ele é a ponte entre o porteiro e o estoque. O `DATABASE_HOST: postgres` funciona porque, dentro da rede do Docker, o nome do serviço vira um "endereço" — o Strapi encontra o banco só pelo nome. E o `depends_on` com `service_healthy` evita o erro clássico de o atendente tentar trabalhar antes de o almoxarifado abrir.

### 1.3 O porteiro (`nginx`)
```yaml
nginx:
  ports:
    - "80:80"
    - "443:443"                  # o ÚNICO com porta para a rua
  volumes:
    - ./nginx/gypsophila.conf:/etc/nginx/conf.d/default.conf:ro  # ":ro" = somente leitura
  networks:
    - frontend                   # só conversa com o atendente
```
O `:ro` no final do volume significa *read-only*: o container pode ler a configuração, mas não alterá-la. É uma trava simples de segurança.

### 1.4 Os dois corredores (a parte que protege tudo)
```yaml
networks:
  backend:
    internal: true   # ESTA linha é o cadeado: corredor sem saída para a internet
  frontend:
    driver: bridge
```
`internal: true` é o detalhe de segurança que mais importa: é o que transforma o corredor do banco em um beco fechado.

### 1.5 As gavetas (volumes)
```yaml
volumes:
  postgres-data:     # dados do banco
  strapi-uploads:    # imagens enviadas pelo lojista
```
Declarar aqui cria gavetas com nome, gerenciadas pelo Docker, que sobrevivem a reinícios e rebuilds.

> **Resumo do arquivo:** ele só diz três coisas — *quem existe*, *quem fala com quem* e *o que precisa sobreviver a reinícios*. Nada além. Isso é KISS.

---

## Passo 2 — `Dockerfile` (a receita da imagem do Strapi)

**Por que isto existe?** O Postgres e o Nginx têm imagens oficiais prontas — por isso, no compose, usamos `image:`. O Strapi **não tem imagem oficial**: cada projeto constrói a sua, porque a imagem precisa conter *o seu código*. Por isso o serviço `strapi` usa `build:` em vez de `image:`.

O arquivo tem **dois estágios**. Pense em montar um móvel:

```dockerfile
# ── Estágio 1: build (a marcenaria, bagunçada) ──
FROM node:20-alpine AS build
RUN apk add --no-cache build-base ... vips-dev   # ferramentas pesadas p/ montar
WORKDIR /opt/app
COPY package*.json ./
RUN npm ci                # instala dependências
COPY . .
RUN npm run build         # gera o painel administrativo
```
O estágio `build` é a oficina: cheio de ferramentas e serragem (compiladores, dependências de desenvolvimento). Bom para montar, ruim para entregar — é pesado.

```dockerfile
# ── Estágio 2: runtime (o móvel limpo, pronto para entrega) ──
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /opt/app
COPY --from=build /opt/app ./   # traz só o resultado pronto da oficina
RUN chown -R node:node /opt/app
USER node                       # deixa de rodar como root
CMD ["npm", "run", "start"]
```
O estágio `runtime` pega **só o resultado pronto** da oficina e descarta a serragem — a imagem final fica menor. As duas últimas linhas são segurança pura: `USER node` faz a aplicação rodar como um usuário comum, não como administrador (root). Se algo for comprometido, o estrago é limitado.

**Por que `COPY package*.json` antes de `COPY . .`?** Truque de cache: o Docker reaproveita etapas que não mudaram. Como as dependências mudam menos que o código, instalá-las primeiro deixa os builds seguintes muito mais rápidos.

---

## Passo 3 — `.env` e os segredos (o cofre)

**O que é?** Um arquivo de "variáveis de ambiente": valores que mudam de máquina para máquina (senhas, chaves) e que **nunca** podem ir para o código versionado. O código lê esses valores em tempo de execução.

O Strapi 5 exige seis segredos. O `.env.example` é o molde; você copia para `.env` e preenche:

```bash
APP_KEYS=trocar1,trocar2,trocar3,trocar4
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
TRANSFER_TOKEN_SALT=
JWT_SECRET=
ENCRYPTION_KEY=
DATABASE_PASSWORD=
```

**Gerando valores aleatórios e seguros:**
```bash
# Rode para cada salt/secret/encryption key:
openssl rand -base64 32

# APP_KEYS precisa de 4 chaves separadas por vírgula:
echo "$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16),$(openssl rand -base64 16)"
```

**Regra de ouro:** o arquivo `.env` real **nunca** entra no Git. Garanta que `.env`, `backups/` e `nginx/certs/` estão no `.gitignore`. As mesmas três variáveis de banco (`DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`) alimentam tanto o container do Postgres quanto o do Strapi — uma fonte única, sem repetição.

---

## Passo 4 — `nginx/gypsophila.conf` (o porteiro fala HTTPS e barra abuso)

Este arquivo configura o porteiro. Três tarefas, em ordem:

**(a) Manda todo mundo para o HTTPS:**
```nginx
server {
    listen 80;                              # quem chega pela porta insegura (HTTP)...
    return 301 https://$host$request_uri;   # ...é redirecionado para a segura (HTTPS)
}
```

**(b) Atende em HTTPS com headers de segurança:**
```nginx
server {
    listen 443 ssl;
    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options    "nosniff" always;
    add_header X-Frame-Options           "SAMEORIGIN" always;
    add_header Referrer-Policy           "strict-origin-when-cross-origin" always;

    client_max_body_size 25M;   # permite upload de fotos grandes
```
Cada `add_header` é uma instrução de segurança ao navegador: forçar HTTPS no futuro (HSTS), não "adivinhar" tipos de arquivo (nosniff), não permitir que o site seja embutido em iframes de terceiros (frame-options).

> **Atenção (uma pegadinha real):** o Strapi já define sua própria política de conteúdo (CSP) internamente. Se você definir CSP *também* aqui, o painel admin costuma quebrar. Por isso este arquivo **não** define CSP — isso fica no Strapi (`config/middlewares.js`).

**(c) Encaminha para o atendente e barra abuso:**
```nginx
    location / {
        limit_req zone=api_limit burst=20 nodelay;   # rate limiting (anti-força bruta)
        proxy_pass http://strapi:1337;                # entrega o pedido ao Strapi
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
```
O `limit_req` é o porteiro contando quantas vezes a mesma pessoa bate na porta por segundo — se exagerar, espera. O `proxy_pass` é o ato de levar o visitante até o atendente (`strapi:1337`, de novo achado pelo nome na rede).

---

## Passo 5 — `backup.sh` e `restore.sh` (a apólice de seguro)

Dados de catálogo são o ativo do cliente. Perdê-los é inaceitável — por isso o backup é **inegociável** (RNF-016).

**`backup.sh` — em português simples:** "entre no almoxarifado, tire uma foto completa do estoque, comprima essa foto, guarde com data no nome e jogue fora fotos com mais de 14 dias."
```bash
docker compose exec -T postgres \
    pg_dump -U "$DATABASE_USERNAME" -d "$DATABASE_NAME" --clean --if-exists \
    | gzip > "$FILE"          # pg_dump = a foto; gzip = a compressão

find "$BACKUP_DIR" -name 'gypsophila-*.sql.gz' -mtime +14 -delete   # retenção
```

**Agendando para rodar sozinho** (cron do host, todo dia às 3h da manhã):
```
0 3 * * * /caminho/do/projeto/scripts/backup.sh >> /var/log/gypsophila-backup.log 2>&1
```

**`restore.sh` — e por que ele importa tanto:** restaurar é o inverso (descomprime a foto e devolve ao banco). A regra de ouro do mundo real: **um backup que você nunca restaurou não é um backup — é uma esperança.** Teste a restauração de tempos em tempos com `./scripts/restore.sh backups/arquivo.sql.gz`.

---

## Passo 6 — Subir tudo + o fluxo dev → prod (ponto crítico)

### 6.1 O ponto que mais confunde
> **O Content-Type Builder do Strapi só funciona em modo de desenvolvimento.** Em produção ele fica desativado. Você **não** cria as entidades (Produto, Categoria...) pelo painel no servidor.

O fluxo correto, em três frases:
1. **Dev (local):** rode `npm run develop` e crie os content types do documento de Modelagem pelo painel.
2. **Git:** isso gera arquivos `schema.json` — comite-os. Eles *são* o modelo de dados como código.
3. **Prod (este compose):** roda `npm run start`; a estrutura vem do código, e o painel só gerencia *conteúdo*.

Em uma linha: **a estrutura nasce no dev e viaja no Git; o dado nasce no painel de produção.**

### 6.2 Comandos para subir
```bash
cp .env.example .env        # depois edite o .env com os segredos do Passo 3
chmod +x scripts/*.sh       # dá permissão de execução aos scripts

docker compose build        # constrói a imagem do Strapi (Passo 2)
docker compose up -d         # sobe os três containers em segundo plano
docker compose logs -f strapi   # acompanha o Strapi iniciar
```

### 6.3 Sobre os certificados TLS
O Nginx espera `fullchain.pem` e `privkey.pem` em `nginx/certs/`. No VPS, gere-os com o **certbot** (Let's Encrypt). Sem certificados válidos, o bloco HTTPS (443) não sobe. Este é o último passo que destrava o acesso público.

---

## Checklist de conclusão do Milestone 1 (Definition of Done)

- [ ] Projeto Strapi criado e dockerizado.
- [ ] `.env` preenchido com segredos gerados (e fora do Git).
- [ ] `docker compose up -d` sobe os três containers sem erro.
- [ ] Banco **não** acessível de fora (sem `ports:` no Postgres).
- [ ] Content types criados em dev e versionados no Git.
- [ ] HTTPS funcionando com certificado válido.
- [ ] `backup.sh` agendado no cron e `restore.sh` testado ao menos uma vez.

Cumprido isso, o Milestone 1 está fechado.

---

## Próximo passo que iremos seguir

Com a infraestrutura de pé e os content types materializados, partimos para o **Milestone 2 — Front-end (Next.js)**: a vitrine que consome a API do Strapi e que o cliente e os visitantes finalmente enxergam. Próximo documento: [04-guia-milestone-2-frontend.md](04-guia-milestone-2-frontend.md), seguindo o mesmo formato KISS: arquivo por arquivo, o que faz e por quê.

> Cada Milestone seguinte ganhará seu próprio guia, mantendo a mesma estrutura: modelo mental → pré-requisitos → arquivos explicados → checklist → próximo passo.

---

*Fim do Guia — Milestone 1, v1.0.*
