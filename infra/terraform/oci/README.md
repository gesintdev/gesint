# Terraform — Oracle Cloud (Free Tier) + Coolify

Este diretório cria **uma VPS Ubuntu** na Oracle Cloud Infrastructure (OCI), com rede, firewall e (opcionalmente) Docker/Coolify no primeiro boot. O deploy da aplicação Gommo em si é feito pelo **Coolify** — veja [infra/coolify/README.md](../../coolify/README.md).

## O que é Terraform (em 30 segundos)

Terraform é um arquivo de configuração que descreve **o que você quer na nuvem** (rede, VM, regras de firewall). O comando `terraform apply` lê esses arquivos e **cria ou atualiza** os recursos na Oracle automaticamente. Você pode destruir tudo com `terraform destroy` sem apagar o código do projeto.

## Pré-requisitos

1. Conta [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
2. [Terraform](https://developer.hashicorp.com/terraform/install) 1.5+ instalado
3. Chave API OCI configurada (abaixo)
4. Par de chaves SSH no seu PC (`ssh-keygen -t ed25519`)

### Criar chave API OCI

1. Console OCI → **Profile** (ícone) → **User Settings** → **API Keys** → **Add API Key**
2. Gere o par; baixe o `.pem` e guarde em local seguro (ex.: `~/.oci/oci_api_key.pem`)
3. Anote o **fingerprint** exibido
4. Copie os OCIDs de **Tenancy**, **User** e **Compartment** (Identity → Compartments)

### Always Free — shape recomendado

| Shape | CPU / RAM | Uso |
|-------|-----------|-----|
| `VM.Standard.A1.Flex` | até 4 OCPU / 24 GB (total na conta) | **Recomendado** — stack Gommo + Coolify + Postgres |
| `VM.Standard.E2.1.Micro` | 1 / 1 GB | Só testes; muito apertado para 4 apps + DB |

No `terraform.tfvars`, o exemplo usa **2 OCPU / 12 GB** — ajuste conforme sua cota Free Tier.

## Uso rápido

```powershell
cd infra/terraform/oci
copy terraform.tfvars.example terraform.tfvars
# Edite terraform.tfvars com seus OCIDs, chave SSH e allowed_ssh_cidr (seu IP/32)

terraform init
terraform plan
terraform apply
```

Após o `apply`, anote o **IP público** nos outputs:

```powershell
terraform output instance_public_ip
terraform output next_steps
```

Conecte por SSH:

```powershell
ssh ubuntu@SEU_IP
```

## Instalar Coolify na VPS

Se `install_coolify_on_boot = false` (padrão), na VPS:

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash
```

Painel: `http://SEU_IP:8000` (porta liberada só para `allowed_ssh_cidr` na security list OCI).

## Segurança

- **Nunca** commite `terraform.tfvars` nem o arquivo `.pem` da API.
- `allowed_ssh_cidr` deve ser **seu IP** com máscara `/32`, não `0.0.0.0/0`.
- A porta **8000** (Coolify) também está restrita ao mesmo CIDR — altere quando seu IP mudar (`terraform apply` de novo).
- Em produção, use domínios com HTTPS no Coolify (Let's Encrypt).

## Destruir a infraestrutura

```powershell
terraform destroy
```

Isso remove VM, VCN e regras criadas por este módulo. **Não** apaga volumes órfãos de outros recursos manuais na conta.

## Troubleshooting

| Problema | Solução |
|----------|---------|
| `Out of host capacity` (Ampere) | Troque de AD/região ou tente de madrugada; é limite da Oracle |
| `401 NotAuthenticated` | Confira fingerprint, `.pem` e OCIDs no `terraform.tfvars` |
| SSH recusado | Aguarde cloud-init (~3 min); confira `allowed_ssh_cidr` |
| Coolify não abre | Security list + `ufw` na VM; libere 8000 só do seu IP |

## Arquivos

| Arquivo | Função |
|---------|--------|
| `network.tf` | VCN, subnet pública, gateway, firewall (22, 80, 443, 8000) |
| `compute.tf` | Instância Ubuntu + cloud-init |
| `cloud-init.yaml.tpl` | Docker e Coolify opcionais no boot |
| `variables.tf` | Parâmetros configuráveis |
| `outputs.tf` | IP, comando SSH, próximos passos |
