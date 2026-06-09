# Gommo Frontend

## Executar

```bash
cp .env.example .env.local
npm install
npm run dev
```

API padrão: `http://localhost:8081`

Credenciais: use `DEV_ADMIN_PASSWORD` configurado no backend (veja `.env.example` na raiz do monorepo).

## Exceções

Catálogo de códigos, mapa de caracteres Unicode, **checklist UTF-8** (revisar sempre) e conversor: **[README do monorepo](../README.md#utf-8--revisar-sempre-mapa-mental-do-projeto)**.

Arquivos deste projeto:

- `src/shared/exceptions/` — `AppException`, `ExceptionCapture`, `message-registry`
- `src/modules/collaborator/exceptions/` — Colaboradores
- `src/modules/root/exceptions/` — Auth
