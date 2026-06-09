# Multi-tenant — desenvolvimento local

Como testar isolamento por tenant **sem DNS real** de producao.

**Pre-requisito:** [multi-tenant.md](./multi-tenant.md)

---

## 1. Dev vs producao (mesma arquitetura, hosts diferentes)

| Conceito | Desenvolvimento | Producao |
|----------|-----------------|----------|
| Host do tenant | `empresa-a.localhost:3000` | `empresa-a.gommo.com.br` |
| Resolver tenant | `Host` + `X-Tenant-Slug` | `Host` (+ header se API separada) |
| Schema de dados | `tenant_empresa_a` | `tenant_empresa_a` |
| Lookup metadados | `admin.client` | `admin.client` |
| JWT com `tenantId` | Sim | Sim |
| Usuario do cliente | So no subdominio do tenant | So no subdominio do tenant |
| Operador Gommo (platform) | `localhost:3000` (schema `public`) | Host dedicado ou admin separado |
| Sessao / cookies | Por host (`empresa-a.localhost`) | Por host (`empresa-a.gommo.com.br`) |

O modelo de **control plane + data plane** e o mesmo. O que muda em dev e principalmente o **hostname** e portas separadas (frontend `:3000`, API `:8081`).

---

## 2. URLs locais

| URL | Sistema | Tenant / modo |
|-----|---------|----------------|
| `http://localhost:3001` | Admin frontend | — |
| `http://localhost:8082` | Admin API | — |
| `http://empresa-a.localhost:3000` | ERP HR | `empresa-a` |
| `http://empresa-b.localhost:3000` | ERP HR | `empresa-b` |
| `http://localhost:3000` | ERP HR | **platform** (so `admin.admin_user`) |
| `http://localhost:8081` | HR API | mesmo resolver do `Host` / header |

Browsers modernos resolvem `*.localhost` para `127.0.0.1` **sem** editar `hosts`.

---

## 3. Variaveis de ambiente

### Raiz do monorepo (`gommo/.env`) — backend HR + compose

```env
GOMMO_MULTI_TENANT_ENABLED=true
GOMMO_TENANT_HEADER_ENABLED=true
GOMMO_TENANT_BASE_DOMAIN=localhost

CORS_ORIGINS=http://localhost:3000,http://*.localhost:3000,http://localhost:3001
```

| Variavel | Descricao |
|----------|-----------|
| `GOMMO_MULTI_TENANT_ENABLED` | Liga resolver + troca de schema no HR |
| `GOMMO_TENANT_HEADER_ENABLED` | Aceita `X-Tenant-Slug` (browser e Postman) |
| `GOMMO_TENANT_BASE_DOMAIN` | Sufixo DNS local (`localhost`; em prod: `gommo.com.br`) |

### `gommo-frontend/.env.local` — frontend HR

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_MULTI_TENANT_ENABLED=true
AUTH_URL=http://localhost:3000
AUTH_SECRET=...
```

`NEXT_PUBLIC_*` **nao** e lido do `.env` da raiz; precisa estar no projeto do frontend.

### Header de API (Postman / curl)

```http
GET http://localhost:8081/api/v1/collaborators
Authorization: Bearer <token>
X-Tenant-Slug: empresa-a
```

Com subdominio no browser (`empresa-a.localhost:3000`), o frontend envia o header automaticamente.

---

## 4. Banco local — schemas

```
postgres / database gommo
├── admin                 (control plane)
├── public                (dev legado + auth compartilhado)
├── tenant_empresa_a      (RH Empresa A)
└── tenant_empresa_b      (RH Empresa B)
```

### Cadastro no admin

1. Subir Postgres: `docker compose up -d postgres`
2. Admin (`:3001` / `:8082`)
3. **Clientes** — estrategia `DEDICATED_SCHEMA`, schema `tenant_{slug}`, subdominio = slug
4. **Testar conexao** → **Executar provisionamento** (cria schema + tabelas)
5. Assinatura `ACTIVE` + usuario administrativo do tenant

Script manual alternativo: `scripts/dev/seed-tenant-empresa-a.sql`

---

## 5. Autenticacao e logout (frontend HR)

### Por que nao usar `signOut({ callbackUrl: "/login" })`?

O Auth.js usa `AUTH_URL` fixo no `.env` (`http://localhost:3000`). Em multi-tenant cada licenca tem **host proprio** (`empresa-a.localhost`, depois `empresa-a.gommo.com.br`). O `signOut` client-side redirecionaria para o host errado.

### Padrao adotado (dev e producao)

Funcao `signOutToTenantLogin()` em `gommo-frontend/src/shared/lib/tenant.ts`:

1. Mostra overlay "Saindo..." (evita card de usuario vazio)
2. `signOut({ redirect: false })` via POST (sem tela de confirmacao do Auth.js)
3. `window.location.replace(<login no host atual>)` — nao usa `callbackUrl` do Auth.js (ele forca `AUTH_URL` / localhost)

**Nao** navegar com GET para `/api/auth/signout` — isso abre pagina "Signout / Are you sure?" e o redirect pos-confirmacao ignora o subdominio.

### Sessao por tenant

Cookies de sessao sao por host — usuario logado em `empresa-a` **nao** esta logado em `empresa-b`. Comportamento desejado.

---

## 6. Checklist de teste manual

- [ ] `http://empresa-a.localhost:3000` — login usuario A — ve so dados do tenant A
- [ ] `http://empresa-b.localhost:3000` — login usuario B — isolamento
- [ ] Usuario A **nao** autentica em `localhost:3000` (sem subdominio)
- [ ] **Sair** em `empresa-a.localhost` volta para `empresa-a.localhost/login` (nao `localhost/login`)
- [ ] Dashboard zerado no tenant novo (sem vazar dados de `public`)
- [ ] Tenant `SUSPENDED` ou nao provisionado — erro claro
- [ ] Admin (`localhost:3001`) independente do resolver HR

---

## 7. CORS e cookies (dev)

| Config | Valor |
|--------|-------|
| `CORS_ORIGINS` (HR) | `http://localhost:3000,http://*.localhost:3000` |
| Cookies NextAuth | Um por host de tenant |

Em **producao**, preferir **same-origin** (frontend + API no mesmo host via proxy) para simplificar CORS e cookies. Ver [multi-tenant.md](./multi-tenant.md) secao 8.

---

## 8. Alternativas se `*.localhost` falhar

### Arquivo hosts

```
127.0.0.1 empresa-a.gommo.test
127.0.0.1 empresa-b.gommo.test
```

`GOMMO_TENANT_BASE_DOMAIN=gommo.test` e acesse `http://empresa-a.gommo.test:3000`.

---

## 9. Troubleshooting

| Sintoma | Causa provavel |
|---------|----------------|
| `TENANT_NOT_FOUND` | Subdominio nao cadastrado em `admin.client` |
| `TENANT_NOT_READY` | Provisionamento nao executado |
| `TENANT_HOST_REQUIRED` | Usuario de cliente tentou login em `localhost` sem subdominio |
| Login OK mas erro ao carregar dados | Schema vazio ou enums (`search_path` sem `public`) |
| Logout vai para `localhost` | Frontend sem rebuild ou `signOut` client em vez de `signOutToTenantLogin` |
| CORS error | Falta `http://*.localhost:3000` em `CORS_ORIGINS` |
| Mesmos dados em A e B | Schema nao trocado ou tabelas so em `public` |
