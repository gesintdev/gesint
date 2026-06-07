# Multi-tenant — desenvolvimento local

Como testar isolamento por tenant **sem DNS real** nem wildcard em produção.

**Pré-requisito:** [multi-tenant.md](./multi-tenant.md)

---

## 1. Estratégia em três camadas

| Camada | Uso | Produção equivalente |
|--------|-----|----------------------|
| **`{slug}.localhost`** | Browser, fluxo E2E | `{slug}.gommo.com.br` |
| **Fallback env + header** | Dev rápido, Postman | Desabilitado |
| **`TenantContext` em testes** | `mvn test`, CI | N/A |

---

## 2. URLs locais

| URL | Sistema | Tenant |
|-----|---------|--------|
| `http://localhost:3001` | Admin | — |
| `http://localhost:8082` | Admin API | — |
| `http://empresa-a.localhost:3000` | ERP HR | `empresa-a` |
| `http://empresa-b.localhost:3000` | ERP HR | `empresa-b` |
| `http://localhost:3000` | ERP HR | fallback `GOMMO_DEV_TENANT_SLUG` |
| `http://localhost:8081` | HR API | mesmo resolver do Host |

Browsers modernos resolvem `*.localhost` ? `127.0.0.1` **sem** editar `hosts`.

---

## 3. Variáveis de ambiente (dev)

Adicionar ao `.env` na raiz:

```env
# Multi-tenant (somente dev/test)
GOMMO_DEV_TENANT_SLUG=empresa-a
GOMMO_TENANT_HEADER_ENABLED=true
GOMMO_TENANT_BASE_DOMAIN=localhost
```

| Variável | Descrição |
|----------|-----------|
| `GOMMO_DEV_TENANT_SLUG` | Tenant quando Host = `localhost` (sem subdomínio) |
| `GOMMO_TENANT_HEADER_ENABLED` | Aceita `X-Tenant-Slug` em profile dev/test |
| `GOMMO_TENANT_BASE_DOMAIN` | Sufixo para extrair subdomínio (`localhost` ou `gommo.com.br`) |

### Header de API (Postman / curl)

Somente com `GOMMO_TENANT_HEADER_ENABLED=true`:

```http
GET http://localhost:8081/api/v1/payroll-runs
Authorization: Bearer <token>
X-Tenant-Slug: empresa-b
Host: localhost:8081
```

---

## 4. Banco local — dois tenants de exemplo

Um Postgres (`docker compose`), schemas:

```sql
-- Control plane (já existe)
admin

-- Data plane (criar no provisionamento dev)
tenant_empresa_a
tenant_empresa_b
```

### Cadastro no admin

1. Subir stack: `docker compose up -d postgres`
2. Admin backend + frontend (`:8082`, `:3001`)
3. **Clientes ?** criar:

| Campo | Empresa A | Empresa B |
|-------|-----------|-----------|
| slug | `empresa-a` | `empresa-b` |
| subdomain | `empresa-a` | `empresa-b` |
| database_strategy | `DEDICATED_SCHEMA` | `DEDICATED_SCHEMA` |
| database_schema | `tenant_empresa_a` | `tenant_empresa_b` |
| database_host | `localhost` | `localhost` |
| database_name | `gommo` | `gommo` |

4. Testar conexão ? Provisionar ? Assinatura `ACTIVE`
5. Criar usuário administrativo de cada tenant

*(Etapa 4 do plano de implementação automatiza criação de schema + Flyway + seed.)*

---

## 5. Checklist de teste manual

- [ ] `http://empresa-a.localhost:3000` — login usuário A — vê só dados A
- [ ] `http://empresa-b.localhost:3000` — login usuário B — vê só dados B
- [ ] Usuário A **não** autentica no contexto B (mesmo password, tenant errado)
- [ ] `localhost:3000` com `GOMMO_DEV_TENANT_SLUG=empresa-a` equivale ao primeiro item
- [ ] API com `X-Tenant-Slug: empresa-b` retorna dados B
- [ ] Tenant `SUSPENDED` ou `provisioning_status != READY` ? erro claro
- [ ] Admin (`localhost:3001`) continua sem resolver tenant HR

---

## 6. Alternativas se `*.localhost` falhar

### Arquivo hosts (Windows)

```
127.0.0.1 empresa-a.gommo.test
127.0.0.1 empresa-b.gommo.test
```

Acesse `http://empresa-a.gommo.test:3000`. Configure `GOMMO_TENANT_BASE_DOMAIN=gommo.test`.

### nip.io (rede externa)

```
http://empresa-a.127.0.0.1.nip.io:3000
```

Útil para demo; depende de DNS público.

---

## 7. CORS e cookies (dev)

| Config | Valor sugerido |
|--------|----------------|
| `CORS_ORIGINS` (HR backend) | incluir `http://*.localhost:3000` ou listar cada tenant |
| NextAuth | cookie por host (`empresa-a.localhost`) — tenants **não** compartilham sessão (desejável) |

---

## 8. Testes automatizados

Sem HTTP/DNS:

```java
// Pseudocódigo — Etapa 2+
TenantContextHolder.set(TenantFixtures.EMPRESA_A);
try {
    // call service / MockMvc
} finally {
    TenantContextHolder.clear();
}
```

Testcontainers: um Postgres, schemas `tenant_test_a` / `tenant_test_b`, `@Sql` por schema.

---

## 9. Troubleshooting

| Sintoma | Causa provável |
|---------|----------------|
| `TENANT_NOT_FOUND` | Subdomínio não cadastrado em `admin.client` |
| `TENANT_NOT_READY` | Provisionamento não concluído |
| `TENANT_SUSPENDED` | Assinatura inativa |
| Login OK mas 403 em API | JWT sem `tenantId` ou mismatch com Host |
| CORS error | Origem `*.localhost:3000` não listada |
| Mesmos dados em A e B | Schema não trocado — bug no resolver |
