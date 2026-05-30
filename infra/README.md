# Infraestrutura Gommo

Deploy em produção na **Oracle Cloud Free Tier** com **Terraform** (VPS) e **Coolify** (aplicação).

## Caminho recomendado

1. **[terraform/oci/](terraform/oci/README.md)** — cria a VPS Ubuntu, rede e firewall (`terraform apply`)
2. Instale o **Coolify** na VPS (script oficial ou `install_coolify_on_boot`)
3. **[coolify/](coolify/README.md)** — importe o monorepo e use `infra/coolify/docker-compose.yml`

## Estrutura

```
infra/
├── terraform/oci/     # Oracle Cloud (VCN + VM + cloud-init)
├── coolify/           # Docker Compose + .env.example para o painel Coolify
└── README.md          # Este arquivo
```

## Imagens Docker (produção)

Cada app tem `Dockerfile` na própria pasta:

| App | Contexto build |
|-----|----------------|
| HR API | `gommo-backend/` |
| Admin API | `gommo-admin-backend/` |
| HR Web | `gommo-frontend/` |
| Admin Web | `gommo-admin-frontend/` |

Desenvolvimento local continua com `docker compose` na **raiz** do repositório (perfil dev com hot reload).

## Segurança

- Não versionar `terraform.tfvars`, `.pem` da API OCI nem `.env` com senhas
- Restringir SSH e painel Coolify (8000) ao seu IP
- Usar HTTPS e segredos fortes em produção
