# Infraestrutura Gesint

Deploy em produção em VPS (Hostinger KVM, etc.) com **Coolify**.

## Caminho recomendado

1. Provisionar a VPS (painel Hostinger / outro provedor)
2. Instalar o **Coolify** na VPS
3. **[coolify/](coolify/README.md)** — **4 Applications + 1 PostgreSQL** (deploys isolados; ideal em 8 GB RAM)
4. Alternativa: Docker Compose único (`infra/coolify/docker-compose.yml`) se preferir simplicidade e tiver ≥12 GB
5. Simulação local de build/deploy: `infra/coolify/docker-compose.local.yml` + `.env` em cada app

## Estrutura

```
infra/
├── coolify/           # Guia Coolify + env examples + Compose
│   ├── README.md
│   ├── docker-compose.yml          # Coolify (stack unica)
│   ├── docker-compose.local.yml    # Teste local estilo apps separados
│   ├── .env.example
│   └── env/                        # Templates por app (Coolify)
└── README.md
```

Envs por app (simulacao = mesmo formato do servidor): `gesint-backend/.env`, `gesint-admin-backend/.env`, `gesint-frontend/.env`, `gesint-admin-frontend/.env`.

## Imagens Docker (produção)

Cada app tem `Dockerfile` na própria pasta:

| App | Contexto build |
|-----|----------------|
| Client API | `gesint-backend/` (build target `prod`) |
| Admin API | `gesint-admin-backend/` |
| Client Web | `gesint-frontend/` |
| Admin Web | `gesint-admin-frontend/` |

Desenvolvimento local continua com `docker compose` na **raiz** do repositório (perfil dev com hot reload).

## Segurança

- Não versionar `.env` com senhas nem chaves privadas
- Restringir SSH e painel Coolify (8000) ao seu IP
- Usar HTTPS e segredos fortes em produção
