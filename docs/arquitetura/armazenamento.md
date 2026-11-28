# Armazenamento de arquivos

Decisão de direção para a integração com object storage. O código vigente continua em disco local.

**Status:** disco local em produção e em desenvolvimento. Nuvem ainda não integrada.

**Relacionado:**

- Código: `gesint-backend` / `br.com.gesint.modules.storage`
- Volume de produção: [infra/coolify/README.md](../../infra/coolify/README.md) (`/data/storage`)
- Boot: [docs/ops/producao-gesint.md](../ops/producao-gesint.md)

## Hoje

O blob fica no disco do Client backend. A propriedade é `gesint.storage.local-base-path` (`STORAGE_LOCAL_PATH`). O padrão local é `./data/storage`; em produção o Coolify monta um volume em `/data/storage`. O nome do bucket (`STORAGE_BUCKET`, padrão `gesint-local` / `gesint-prod`) é só rótulo gravado no metadado — não há bucket remoto.

Metadados ficam no Postgres do tenant, nas tabelas `storage_object` e `storage_object_link`. O contrato dos outros módulos é `IStorageService`: upload, vínculo com a entidade (foto de ponto, ASO, laudo, currículo e demais anexos), download e exclusão. Quem chama storage não escolhe onde o arquivo mora.

`storage_object` já tem o formato de object storage: `bucket`, `object_key`, `etag`, `storage_class`, `version_id`. A coluna `local_file_path` existe só porque a gravação atual é arquivo no disco.

## Decisão: Cloudflare R2

Quando o disco local for substituído por serviço de armazenamento em nuvem, o provedor é o **Cloudflare R2**.

Motivos registrados (pesquisa de 2026, a confirmar na época da integração com a tabela de preços vigente):

1. **Sem taxa de egress.** O ERP baixa arquivo o tempo todo — foto de ponto, ASO, laudo, currículo, holerite. No Amazon S3 o tráfego de saída costuma ser a maior parte da conta. No R2 o egress para a internet não é cobrado; cobra-se armazenamento e classe de operação (escrita e leitura).
2. **API compatível com S3.** O modelo atual (`bucket`, `object_key`, `etag`) conversa com essa API. A implementação pode usar um cliente S3 apontando para o endpoint do R2. O serviço contratado é o R2; a Amazon não é o provedor.
3. **A Gesint já opera na Cloudflare** (DNS `*.gesint.com.br` e o Worker do site). A integração não acrescenta um fornecedor novo na produção.

Amazon S3 fica fora do caminho padrão. Só volta a ser opção se esta decisão for reaberta de propósito, com comparação de preço e de operação na data da integração.

## O que a integração deve preservar

- `IStorageService` continua o único contrato. A troca é da gravação e da leitura do blob, não da API dos módulos.
- Metadados permanecem no Postgres do tenant. O bucket guarda o arquivo, não o catálogo.
- Desenvolvimento e teste seguem em disco local. R2 é alvo de produção, atrás de configuração explícita.
- Isolamento entre clientes: prefixo (ou bucket) por tenant, no mesmo espírito do schema dedicado. Arquivo de um tenant não entra no prefixo de outro.
- Até a migração, o volume `/data/storage` do Coolify continua obrigatório. Sem ele o upload responde `STORAGE_UPLOAD_FAILED`.
