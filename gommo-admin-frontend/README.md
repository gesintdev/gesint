# gommo-admin-frontend

Painel administrativo Gommo — gestão de **clientes (tenants)**, assinatura, pagamentos e operadores da plataforma.

- Porta: **3001**
- API: `NEXT_PUBLIC_ADMIN_API_URL` (padrão `http://localhost:8082`)

## Menus

- **Visão geral**
- **Clientes** — cadastro, usuários administrativos do tenant, status/assinatura, pagamentos; permissões do cliente ainda em evolução
- **Tutorial (PT-BR):** [docs/TUTORIAL-PAINEL-ADMIN.md](docs/TUTORIAL-PAINEL-ADMIN.md) — control plane, provisionamento e fluxo de onboarding
- **Operação Gommo** — operadores do painel admin

Organização (empresa, departamentos, cargos, usuários internos do RH) fica no **gommo-frontend** (`:3000`).

## Executar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Login com o usuário criado em `admin.admin_user` (dev: `DEV_ADMIN_PASSWORD` no `.env` da raiz).

Usuários admin também podem acessar o `gommo-frontend` com o mesmo token (permissões completas no HR).
