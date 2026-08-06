# Infraestrutura Gommo

Deploy em produção em VPS (Oracle Free Tier, Hostinger KVM, etc.) com **Coolify**.

## Caminho recomendado

1. Provisionar a VPS ([terraform/oci/](terraform/oci/README.md) na Oracle, ou painel Hostinger / outro)
2. Instalar o **Coolify** na VPS
3. **[coolify/](coolify/README.md)** — **4 Applications + 1 PostgreSQL** (deploys isolados; ideal em 8 GB RAM)
4. Alternativa: Docker Compose único (`infra/coolify/docker-compose.yml`) se preferir simplicidade e tiver ≥12 GB
5. Simulação local de build/deploy: `infra/coolify/docker-compose.local.yml` + `.env` em cada app

## Estrutura

```
infra/
├── terraform/oci/     # Oracle Cloud (VCN + VM + cloud-init)
├── coolify/           # Guia Coolify + env examples + Compose
│   ├── README.md
│   ├── docker-compose.yml          # Coolify (stack unica)
│   ├── docker-compose.local.yml    # Teste local estilo apps separados
│   ├── .env.example
│   └── env/                        # Templates por app (Coolify)
└── README.md
```

Envs por app (simulacao = mesmo formato do servidor): `gommo-backend/.env`, `gommo-admin-backend/.env`, `gommo-frontend/.env`, `gommo-admin-frontend/.env`.

## Imagens Docker (produção)

Cada app tem `Dockerfile` na própria pasta:

| App | Contexto build |
|-----|----------------|
| Client API | `gommo-backend/` (build target `prod`) |
| Admin API | `gommo-admin-backend/` |
| Client Web | `gommo-frontend/` |
| Admin Web | `gommo-admin-frontend/` |

Desenvolvimento local continua com `docker compose` na **raiz** do repositório (perfil dev com hot reload).

## Segurança

- Não versionar `terraform.tfvars`, `.pem` da API OCI nem `.env` com senhas
- Restringir SSH e painel Coolify (8000) ao seu IP
- Usar HTTPS e segredos fortes em produção
