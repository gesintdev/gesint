# gommo-admin-backend

API do painel administrativo da plataforma Gommo.

- Porta padrão: **8082**
- Schema PostgreSQL: **admin**
- Autenticação JWT com claim `principalType=PLATFORM_ADMIN` e permissões do HR para acesso ao `gommo-frontend`

## Migrations (Flyway)

- Schema PostgreSQL: **`admin`** (`create-schemas: true` na subida)
- Histórico: **`admin.flyway_schema_history`**
- Arquivos: `src/main/resources/db/migration/V{n}__descricao_snake_case.sql`
- Próximo `V{n}`: olhar **somente** este backend (independente do `gommo-backend`)
- Tabelas do HR em `public` são alteradas **pelo HR backend**, não por migrations aqui

Detalhes: [README do monorepo — Migrations Flyway](../README.md#migrations-flyway-por-schema)

## Testes

Requer PostgreSQL. Com **Docker** rodando, os testes sobem um Postgres via Testcontainers; sem Docker, use `docker compose up -d postgres` na raiz do monorepo.

```bash
cd gommo-admin-backend
mvn test
```

O perfil `test` migra o schema `public` (migrations do `gommo-backend`) e em seguida o schema `admin`.

## Executar localmente

```bash
# Na raiz do monorepo, com Postgres via docker compose up -d postgres
cd gommo-admin-backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Variáveis: use o `.env` da raiz do repositório (`JWT_SECRET`, `DEV_ADMIN_PASSWORD`, credenciais do banco).

### IntelliJ (Debug)

1. Run Configuration → **Active profiles:** `dev`
2. `JWT_SECRET` com **no mínimo 32 caracteres** (mesmo valor do `gommo-backend`)
3. Opcional: plugin **EnvFile** apontando para `../.env` na raiz do monorepo

Há uma config pronta em `.run/GommoAdminApplication.run.xml` (profile `dev`).

## Endpoints principais

| Recurso | Path |
|---------|------|
| Auth | `/api/v1/auth/login`, `/api/v1/auth/refresh` |
| Clientes | `/api/v1/clients` |
| Usuários de clientes | `/api/v1/client-users` |
| Usuários admin | `/api/v1/admin-users` |
