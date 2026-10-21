# Gesint

Monorepo ERP para RH, Departamento Pessoal e Contabilidade, com backends Spring Boot, frontends Next.js, painel admin da plataforma e infra Docker/Coolify.

| Projeto | Pasta | Porta |
|---|---|---|
| Client API | `gesint-backend/` | 8081 |
| Client Web | `gesint-frontend/` | 3000 |
| Admin API | `gesint-admin-backend/` | 8082 |
| Admin Web | `gesint-admin-frontend/` | 3001 |

Produção (domínios, secrets, boot): [`docs/ops/producao-gesint.md`](docs/ops/producao-gesint.md).

## Sistemas do produto

| Sistema | Uso atual |
|---|---|
| DP | Departamento Pessoal: Organizacao, Ferias, Afastamento, Desligamento e Pagamentos |
| RH | Pessoas, solicitacoes de ferias, entrevista de desligamento, performance, insights |
| CTB | Contabilidade: Folha de Pagamento |
| CFG | Configurações: perfis e usuários |

O domínio ativo no frontend vem do rail esquerdo, não da URL. Trocar abas no workspace não deve recalcular o menu lateral.

## Arquitetura multi-tenant

O Gesint usa control plane + data plane.

| Documento | Conteúdo |
|---|---|
| `docs/arquitetura/multi-tenant.md` | Modelo control plane/data plane, DNS e onboarding |
| `docs/arquitetura/multi-tenant-dev.md` | Testes locais (`*.localhost`, fallback dev) |
| `docs/arquitetura/multi-tenant-implementacao.md` | Plano e etapas de implementação |

MVP multi-tenant: schema dedicado por cliente (`tenant_*`), não `tenant_id` em tabelas de negócio.

Ao criar tabela de negócio no HR:

1. Criar migration em `gesint-backend/src/main/resources/db/migration/`.
2. Incluir a tabela em `TenantSchemaTableCatalog.HR_DATA_TABLES` no admin backend.
3. Espelhar em `scripts/dev/seed-tenant-empresa-a.sql`.
4. Sincronizar tenants existentes quando necessário.

## Módulo Folha de Pagamento

Documentação atualizada: `docs/modulos/folha-de-pagamento.md`.

Estado atual: Folha está em CTB/Contabilidade. Pagamentos permanece em DP.

Já existem no código `PayrollRun`, `PayrollEvent`, `Payslip`, `PayslipEntry`, processamento por strategies, lifecycle de competência e PDF com OpenPDF.

## Fluxo de branches

| Branch | Uso | Ambiente |
|---|---|---|
| `main` | Versão estável; recebe merge apenas da `develop` em release | Produção |
| `develop` | Integração contínua de todas as features | Desenvolvimento local |
| `feat/*`, `fix/*`, `chore/*` | Uma atividade por branch, criada a partir da `develop` | Local |

1. `git switch develop && git pull` antes de começar.
2. `git switch -c feat/minha-atividade`.
3. Ao terminar, abrir PR (ou merge) para a `develop`, nunca direto na `main`.
4. Release: merge da `develop` na `main`.

## Início rápido local

1. Copie `.env.example` para `.env` na raiz e configure as variáveis.
2. Suba infraestrutura:

```bash
docker compose up -d
```

3. HR backend:

```bash
cd gesint-backend
mvn spring-boot:run
```

4. HR frontend:

```bash
cd gesint-frontend
npm install
npm run dev
```

5. Admin backend:

```bash
cd gesint-admin-backend
mvn spring-boot:run
```

6. Admin frontend:

```bash
cd gesint-admin-frontend
npm install
npm run dev
```

## Migrations Flyway

Cada backend aplica migrations no seu schema PostgreSQL, com histórico separado.

| Backend | Schema | Histórico | Pasta |
|---|---|---|---|
| `gesint-backend` | `public` | `public.flyway_schema_history` | `gesint-backend/src/main/resources/db/migration/` |
| `gesint-admin-backend` | `admin` | `admin.flyway_schema_history` | `gesint-admin-backend/src/main/resources/db/migration/` |

O próximo `V{n}` deve ser calculado apenas dentro do backend/schema correspondente.

## Exceções e mensagens

A API usa códigos estáveis (`code`) e mensagens em português nos catálogos de cada módulo.

Resposta padrão:

```json
{
  "code": "COLLABORATOR_CPF_ALREADY_EXISTS",
  "message": "CPF já cadastrado",
  "correlationId": "uuid",
  "timestamp": "2026-05-22T12:00:00Z"
}
```

Padrão de implementação:

| Camada | Padrão |
|---|---|
| Backend | `{Modulo}Exceptions.java` + `{Modulo}Exception.java` |
| Frontend API | `{modulo}.messages.ts` + registro em `message-registry.ts` |
| Frontend cliente | `{modulo}.messages.ts` + `{modulo}.client-exception.ts` quando existir |
| Captura global | `ExceptionCapture` em `src/shared/exceptions/` |

## Encoding UTF-8

Regra atual:

- Labels de UI, botões, abas, colunas e textos de tela usam português normal em UTF-8 válido.
- Mensagens em catálogos de exceptions podem usar escapes `\uXXXX` quando necessário para evitar regressões de encoding no Windows.
- Comentários e identificadores devem preferir ASCII.
- Evitar caracteres decorativos em código quando não forem necessários.
- Ao terminar alterações em `.ts`, `.tsx`, `.java`, `.sql`, `.md` ou `.mdc`, validar leitura UTF-8 se houver suspeita de arquivo corrompido.

Validação rápida:

```bash
node -e "require('fs').readFileSync('caminho/arquivo.ts').toString('utf8')"
```

Se aparecer `invalid utf-8 sequence` ou caractere de substituição (`�`), reescrever o arquivo em UTF-8 válido.

## Regras para agentes

As regras ativas ficam em `.agents/rules/`.

Leitura obrigatória antes de alterações:

- `.agents/rules/gesint.mdc`
- `.agents/rules/gesint-frontend-ui.mdc`
- `.agents/rules/gesint-ui-system.mdc` quando tocar UI/frontend
- `.agents/rules/gesint-payroll-module.mdc` quando tocar folha/payroll

Antes de implementar: analisar arquitetura, procurar implementação semelhante, explicar o plano e só então alterar.
