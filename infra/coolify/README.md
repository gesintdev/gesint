# Deploy Gommo com Coolify

O [Coolify](https://coolify.io) roda na sua VPS (provisionada com [Terraform](../terraform/oci/README.md)) e faz build + proxy HTTPS dos containers.

## Visão geral

```mermaid
flowchart LR
  subgraph internet [Internet]
    U[Usuarios]
  end
  subgraph vps [VPS Oracle]
    C[Coolify / Traefik]
    HR[gommo-frontend :3000]
    ADM[gommo-admin-frontend :3001]
    API[gommo-backend :8081]
    AAPI[gommo-admin-backend :8082]
    PG[(PostgreSQL)]
  end
  U --> C
  C --> HR
  C --> ADM
  C --> API
  C --> AAPI
  HR --> API
  ADM --> AAPI
  ADM --> API
  API --> PG
  AAPI --> PG
```

## 1. Instalar Coolify na VPS

Se ainda não instalou:

```bash
ssh ubuntu@SEU_IP_PUBLICO
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Acesse `http://SEU_IP:8000`, crie o usuário admin e conecte o servidor (localhost).

## 2. Criar o projeto no Coolify

1. **+ Add Resource** → **Docker Compose**
2. Conecte o repositório Git do Gommo (GitHub/GitLab)
3. Configuração importante:

| Campo | Valor |
|-------|--------|
| **Base Directory** | `/` (raiz do monorepo) |
| **Docker Compose location** | `infra/coolify/docker-compose.yml` |
| **Build pack** | Docker Compose |

4. Em **Environment Variables**, copie as chaves de [`.env.example`](.env.example) e preencha com valores reais (senhas fortes).

## 3. URLs públicas (sem domínio próprio ou com domínio)

Cada serviço do Compose precisa de uma URL pública no Coolify (exceto `postgres`).

### Teste sem domínio próprio (FQDN do Coolify)

1. Abra **cada serviço** (`gommo-frontend`, `gommo-admin-frontend`, `gommo-backend`, `gommo-admin-backend`).
2. Em Domains / Settings, use a **FQDN gerada pelo Coolify** (ex.: `*.sslip.io`) e deixe HTTPS ativo se o Coolify oferecer.
3. Copie a URL completa de cada serviço (**https**, **sem barra final**) e cole nas variáveis de ambiente (veja [`.env.example`](.env.example)).
4. Salve as envs e faça **Redeploy com rebuild** — `NEXT_PUBLIC_*` entram no build do Next.js.

| Serviço | Porta interna | Onde colar a FQDN do Coolify |
|---------|---------------|------------------------------|
| `gommo-frontend` | 3000 | `HR_NEXTAUTH_URL` e primeiro item de `CORS_ORIGINS` |
| `gommo-backend` | 8081 | `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_HR_API_URL` |
| `gommo-admin-frontend` | 3001 | `ADMIN_NEXTAUTH_URL`, `ADMIN_AUTH_URL`, `ADMIN_CORS_ORIGINS` e segundo item de `CORS_ORIGINS` |
| `gommo-admin-backend` | 8082 | `NEXT_PUBLIC_ADMIN_API_URL` |

**Importante:** `GOMMO_HR_BASE_URL` **não** é a FQDN pública. É a URL interna Docker: `http://gommo-backend:8081` (já com default no compose).

### Depois, com domínio próprio

Troque as FQDNs do Coolify pelos hosts desejados e ative Let's Encrypt:

| Serviço | Sugestão de host |
|---------|------------------|
| `gommo-frontend` | `app.seudominio.com.br` |
| `gommo-admin-frontend` | `admin.seudominio.com.br` |
| `gommo-backend` | `api.seudominio.com.br` |
| `gommo-admin-backend` | `admin-api.seudominio.com.br` |

Atualize as envs e faça **Redeploy com rebuild**.

O Postgres **não** recebe domínio público — apenas a rede interna Docker.

## 4. Variáveis obrigatórias

Gere segredos (PowerShell):

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Mínimo para subir:

- `POSTGRES_PASSWORD`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `GOMMO_INTERNAL_EVENT_SECRET`
- URLs públicas = FQDNs do Coolify (ou domínio próprio) alinhadas ao passo 3
- `GOMMO_HR_BASE_URL=http://gommo-backend:8081` (interno; default no compose)

Consulte [`.env.example`](.env.example) para a lista completa.

## 5. Primeiro deploy

1. **Deploy** no Coolify e acompanhe os logs de build (Maven + Next podem levar 10–20 min na primeira vez em VPS Free Tier).
2. Flyway roda automaticamente nos backends (`public` e `admin`).
3. Crie o usuário admin inicial conforme o README do `gommo-admin-backend` (seed/migration de dev **não** deve ir para produção sem revisão).

## 6. Recursos na Oracle Free Tier

Stack completa (~4 GB RAM nos limites do compose). Recomendado na VM Ampere:

- **2 OCPU / 12 GB RAM** (padrão do Terraform)
- Se faltar memória, reduza limites em `docker-compose.yml` ou suba só HR primeiro

## Deploy alternativo (serviços separados)

Em vez de um Compose único, você pode criar **4 Applications** + **1 Database** no Coolify:

- Database: PostgreSQL 16
- Apps com **Dockerfile** em `gommo-backend/`, `gommo-admin-backend/`, etc.
- Mesmas variáveis de ambiente, apontando `DB_HOST` para o hostname interno do Postgres no Coolify

O Compose único é mais simples para começar.

## Troubleshooting

| Sintoma | O que verificar |
|---------|-----------------|
| Build Maven falha | Logs do Coolify; memória da VPS |
| Deploy morre no meio do `docker compose build` com `exit code 255` / `Error code: 0` sem erro de compile | Quase sempre **falta de RAM** (OOM). Ver secção abaixo |
| CORS no browser | `CORS_ORIGINS` / `ADMIN_CORS_ORIGINS` com a FQDN **exata** do frontend (incluindo https) |
| NextAuth redirect | `HR_NEXTAUTH_URL` / `ADMIN_NEXTAUTH_URL` = FQDN do frontend, sem barra final |
| API aponta pro lugar errado | `NEXT_PUBLIC_*` = FQDN do **backend** correspondente + **rebuild** após mudar |
| Admin não fala com Client | `GOMMO_HR_BASE_URL` deve ser `http://gommo-backend:8081`, não a URL pública |
| 502 no proxy | Healthcheck do backend; Postgres healthy; FQDN ligada ao serviço certo |
| Flyway error | Postgres vazio vs. volume antigo; conferir schemas `public` e `admin` |
| `gommo-backend` unhealthy / deploy aborta no `up -d` | Abra **Logs** do serviço `gommo-backend` no Coolify (ou `docker logs` do container). Causas comuns: `JWT_SECRET` com menos de 32 caracteres, `POSTGRES_PASSWORD` diferente do volume antigo, OOM, erro Flyway |
| Mudei `POSTGRES_PASSWORD` e o backend nao conecta | Volume `gommo_pg_data` guarda a senha antiga. Apague o volume no Coolify **ou** volte a senha original |

### Build abortado no Coolify (notebook / VPS pequena)

O compose sobe **4 imagens** (2× Maven + 2× Next). O Coolify as constrói **em paralelo**. Sem RAM/swap suficiente o kernel ou o Coolify matam o processo no meio — o log para em `#44 RUN mvn ... package` / `Running TypeScript` e fecha com `DeploymentException` / `exit 255`, **sem** falha de compilação.

Mitigações (nessa ordem):

1. **Criar swap** no host do Coolify (notebook ou VPS), ex. 8 GB:

```bash
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

2. **Redeploy** — layers já construídos ficam em cache; retries costumam avançar.
3. Em máquina fraca, prefira o caminho “Deploy alternativo” (apps separados) em vez do compose único.
4. Na VPS de produção, use pelo menos **8–12 GB RAM** (padrão Terraform: 2 OCPU / 12 GB).
