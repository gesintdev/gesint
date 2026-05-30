# Gommo

Monorepo RH / Departamento Pessoal — backends (Spring Boot), frontends (Next.js), painel admin da plataforma e infra (Docker).

| Projeto | Pasta | Porta | Documentação |
|---------|-------|-------|----------------|
| API HR | `gommo-backend/` | 8081 | [README do backend](gommo-backend/README.md) |
| Web HR | `gommo-frontend/` | 3000 | [README do frontend](gommo-frontend/README.md) |
| API Admin | `gommo-admin-backend/` | 8082 | [README do admin backend](gommo-admin-backend/README.md) |
| Web Admin | `gommo-admin-frontend/` | 3001 | [README do admin frontend](gommo-admin-frontend/README.md) |

## Início rápido (local)

1. Copie `.env.example` para `.env` na raiz e defina as variáveis (senha do Postgres, JWT, admin dev).
2. `docker compose up -d`
3. HR: `cd gommo-backend && mvn spring-boot:run` → http://localhost:8081 e `cd gommo-frontend && npm install && npm run dev` → http://localhost:3000
4. Admin: `cd gommo-admin-backend && mvn spring-boot:run` → http://localhost:8082 e `cd gommo-admin-frontend && npm install && npm run dev` → http://localhost:3001

## Deploy — Oracle Cloud + Coolify

Produção na VPS Oracle (Free Tier) com Terraform e painel Coolify:

| Etapa | Documentação |
|-------|----------------|
| Criar VPS (Terraform) | [infra/terraform/oci/README.md](infra/terraform/oci/README.md) |
| Subir stack no Coolify | [infra/coolify/README.md](infra/coolify/README.md) |
| Visão geral da infra | [infra/README.md](infra/README.md) |

## Migrations Flyway (por schema)

Cada backend aplica migrations **no seu schema PostgreSQL**, com histórico Flyway **separado**. Admin e HR podem ter `V1`, `V2`… ao mesmo tempo sem conflito de versionamento.

| Backend | Schema | Histórico | Pasta |
|---------|--------|----------|-------|
| `gommo-backend` | `public` | `public.flyway_schema_history` | `gommo-backend/src/main/resources/db/migration/` |
| `gommo-admin-backend` | `admin` | `admin.flyway_schema_history` | `gommo-admin-backend/src/main/resources/db/migration/` |

Ao criar migration: use o próximo `V{n}` **apenas** do backend/schema correspondente. Alterações em tabelas do HR (`public`) vão no HR; alterações da plataforma admin vão no admin. Escrita cross-schema no código (integração) não substitui migration no backend dono do schema.

---

## Exceções e mensagens

O sistema usa **códigos estáveis** (`code`) na API e **mensagens em português** nos catálogos de cada módulo.

**Regra de encoding nos fontes:** use texto ASCII normal (`CPF`, `Erro`, `login`…) e escape `\uXXXX` **somente em caracteres especiais** (acentos, cedilha, etc.), para evitar quebra de charset no build sem prejudicar a leitura do código.

**Conversor recomendado (texto → `\uXXXX`):**  
https://www.esoapi.com/pt/unicode/converter/

**Referência de caracteres Unicode:**  
https://unicode-table.com/pt/

### Mapa de caracteres especiais (PT-BR)

| Caractere | Unicode | Escape Java / TypeScript |
|-----------|---------|---------------------------|
| á | U+00E1 | `\u00e1` |
| à | U+00E0 | `\u00e0` |
| â | U+00E2 | `\u00e2` |
| ã | U+00E3 | `\u00e3` |
| ç | U+00E7 | `\u00e7` |
| é | U+00E9 | `\u00e9` |
| ê | U+00EA | `\u00ea` |
| í | U+00ED | `\u00ed` |
| ó | U+00F3 | `\u00f3` |
| ô | U+00F4 | `\u00f4` |
| õ | U+00F5 | `\u00f5` |
| ú | U+00FA | `\u00fa` |
| Á | U+00C1 | `\u00c1` |
| É | U+00C9 | `\u00c9` |
| Ê | U+00CA | `\u00ca` |
| Ç | U+00C7 | `\u00c7` |
| Ã | U+00C3 | `\u00c3` |

Exemplo no código:

```java
public static final String MSG = "CPF j\u00e1 cadastrado";
```

```typescript
PERSON_CPF_ALREADY_EXISTS: "CPF j\u00e1 cadastrado";
```

### Mapa de códigos de erro (`code`)

Resposta padrão da API (`4xx` / `5xx`):

```json
{
  "code": "PERSON_CPF_ALREADY_EXISTS",
  "message": "CPF já cadastrado",
  "correlationId": "uuid",
  "timestamp": "2026-05-22T12:00:00Z"
}
```

#### Núcleo (Core)

| Código | HTTP | Mensagem exibida |
|--------|------|------------------|
| `VALIDATION_ERROR` | 400 | Erro de validação |
| `FORBIDDEN` | 403 | Você não tem permissão para esta ação |
| `INTERNAL_ERROR` | 500 | Ocorreu um erro inesperado |
| `UNKNOWN` | — | Ocorreu um erro inesperado *(somente frontend)* |

**Backend:** `gommo-backend/.../core/exception/CoreExceptions.java`  
**Frontend:** `gommo-frontend/src/shared/exceptions/core.messages.ts`

#### Auth

| Código | HTTP | Mensagem exibida |
|--------|------|------------------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Usuário ou senha inválidos |
| `AUTH_INVALID_REFRESH` | 401 | Token de atualização inválido |
| `AUTH_REVOKED_REFRESH` | 401 | Sessão expirada. Faça login novamente |
| `AUTH_EXPIRED_REFRESH` | 401 | Sessão expirada. Faça login novamente |
| `AUTH_USER_NOT_FOUND` | 404 | Usuário não encontrado |
| `AUTH_ERROR` | — | Falha na autenticação *(frontend)* |
| `AUTH_SESSION_EXPIRED` | 401 | Sessão expirada. Faça login novamente *(somente frontend)* |

**Backend:** `gommo-backend/.../modules/root/exception/AuthExceptions.java`  
**Frontend:** `gommo-frontend/src/modules/root/exceptions/auth.messages.ts`

#### Colaboradores

| Código | HTTP | Mensagem exibida |
|--------|------|------------------|
| `COLLABORATOR_NOT_FOUND` | 404 | Colaborador não encontrado |
| `COLLABORATOR_CPF_ALREADY_EXISTS` | 409 | CPF já cadastrado |
| `CPF_ALREADY_EXISTS` | — | CPF já cadastrado *(alias legado no frontend)* |
| `COLLABORATOR_LOAD_FAILED` | — | Não foi possível carregar o colaborador *(somente frontend)* |
| `COLLABORATOR_SAVE_FAILED` | — | Não foi possível salvar o colaborador *(somente frontend)* |

**Backend:** `gommo-backend/.../modules/collaborator/exception/CollaboratorExceptions.java`  
**Frontend:** `gommo-frontend/src/modules/collaborator/exceptions/collaborator.messages.ts`

### Onde implementar

| Camada | Padrão |
|--------|--------|
| Backend | `{Modulo}Exceptions.java` (catálogo) + `{Modulo}Exception.java` (fábricas) |
| Frontend API | `{modulo}.messages.ts` + registro em `message-registry.ts` |
| Frontend cliente | `{modulo}.messages.ts` (`*_CLIENT_MESSAGES`) + `{modulo}.client-exception.ts` |
| Captura global | `ExceptionCapture` em `gommo-frontend/src/shared/exceptions/` |

```typescript
import { ExceptionCapture } from "@/shared/exceptions";

ExceptionCapture.handle(error); // toast + AppException
ExceptionCapture.displayMessage(error); // só texto
```
