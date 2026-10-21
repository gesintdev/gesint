# Produção Gesint — runbook de primeiro boot

## Domínios

| Host | Serviço |
|------|---------|
| `app.gesint.com.br` | Client frontend |
| `*.gesint.com.br` | Tenants Client (wildcard DNS obrigatório) |
| `admin.gesint.com.br` | Admin frontend |
| `api.gesint.com.br` | Client backend |
| `admin-api.gesint.com.br` | Admin backend |
| `gesint.com.br` (apex) | Fora do ERP (marketing depois) |

## Ordem de boot

1. Postgres vazio (volume novo).
2. Subir **gesint-backend** (Flyway `public` + `gesint_types`: V1 schema + V2 catalog).
3. Subir **gesint-admin-backend** (Flyway `admin`: V1 schema + V2 catalog).
4. Frontends (rebuild com `NEXT_PUBLIC_*` dos hosts acima).

## Schema `public`

- **DEV:** template + login de negócio (`GESINT_PUBLIC_LOGIN_ENABLED=true`), usuário `admGesint`.
- **PROD:** apenas template DDL (`public-login-enabled: false`). Clientes comerciais usam `tenant_*`.

Usuário DEV: `admGesint` / e-mail `flavio.henrique.dev@gmail.com`.  
Edição exclusiva: Admin → Configurações → **Ambiente de desenvolvimento**.

## Segredos a gerar (não copiar do lab)

- `JWT_SECRET`, `NEXTAUTH_SECRET` / `AUTH_SECRET`
- `GESINT_INTERNAL_EVENT_SECRET`, `GESINT_SECRET_ENCRYPTION_KEY`
- `POSTGRES_PASSWORD`, `GESINT_PLATFORM_ADMIN_PASSWORD` (prod)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `LLM_API_KEY`
- SMTP no Admin UI após o deploy

## Onboarding de cliente novo

1. Admin → Clientes → cadastro (comprador/CEO).
2. Config. do Ambiente → provisionar schema `tenant_{slug}`.
3. Aba Usuários → criar usuário com token de primeiro acesso.
4. CEO define senha em `https://{slug}.gesint.com.br/definir-senha`.
