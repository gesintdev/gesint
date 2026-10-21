# Gesint Backend

## Pré-requisitos

- Java 21
- Maven
- Docker (PostgreSQL)
- Arquivo `.env` configurado (veja `.env.example` e `.env.example` na raiz do monorepo)

## Subir banco

Na raiz do monorepo, com `.env` criado:

```bash
docker compose up -d
```

## Testes

Requer PostgreSQL. Com **Docker** rodando, os testes sobem um Postgres via Testcontainers; sem Docker, use `docker compose up -d postgres` e o `.env` da raiz (`DB_*` / `GESINT_PLATFORM_ADMIN_PASSWORD` ou `DEV_ADMIN_PASSWORD`).

```bash
cd gesint-backend
mvn test
```

## Executar API

```bash
cd gesint-backend
mvn spring-boot:run
```

Perfil `dev`: cria o usuario sudo `admGesint` se `GESINT_PLATFORM_ADMIN_PASSWORD` ou `DEV_ADMIN_PASSWORD` estiver definido (veja `.env.example`).

## Endpoints

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `CRUD /api/v1/collaborators`
- `GET /actuator/health`

API local: http://localhost:8081

## Migrations (Flyway)

- Schema PostgreSQL: **`public`**
- Histórico: **`public.flyway_schema_history`**
- Arquivos: `src/main/resources/db/migration/V{n}__descricao_snake_case.sql`
- Próximo `V{n}`: olhar **somente** este backend (independente do `gesint-admin-backend`)

Detalhes: [README do monorepo — Migrations Flyway](../README.md#migrations-flyway-por-schema)

## Multi-tenant (Etapas 2-3)

Desligado por padrao (`GESINT_MULTI_TENANT_ENABLED=false`). Quando ativo:

- `TenantResolutionFilter` resolve o tenant pelo `Host` (ou `X-Tenant-Slug` / `GESINT_DEV_TENANT_SLUG` em dev)
- Metadados lidos de `admin.client` no mesmo Postgres
- `TenantSchemaDataSource` executa `SET search_path` por conexao (tenant = schema do cliente + `gesint_types`; sem tenant/`localhost` = `public, gesint_types`)
- Login/refresh/JWT validam vinculo em `admin.client_user` e claims `tenantId` / `tenantSlug`

Documentacao: [docs/arquitetura/multi-tenant-dev.md](../docs/arquitetura/multi-tenant-dev.md)

## Exceções

Catálogo de códigos, mapa de caracteres Unicode e conversor: **[README do monorepo](../README.md#exceções-e-mensagens)**.

Arquivos deste projeto:

- `src/main/java/br/com/gesint/core/exception/` — núcleo e `GlobalExceptionHandler`
- `src/main/java/br/com/gesint/modules/collaborator/exception/` — Colaboradores
- `src/main/java/br/com/gesint/modules/root/exception/` — Auth
