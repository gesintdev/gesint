# Módulo Folha de Pagamento

Documentação oficial do módulo de Folha de Pagamento do Gommo ERP.

**Domínio atual:** CTB — Contabilidade

**Observação de produto:** o menu **Pagamentos** permanece em DP — Departamento Pessoal.

**Legislação e referências de negócio:** CLT, eSocial, INSS, FGTS, IRRF, férias, 13º salário, rescisões, afastamentos.

---

## 1. Propósito do módulo

O módulo de Folha de Pagamento centraliza competências, eventos/rubricas, holerites, lançamentos, processamento da folha, revisão, fechamento e emissão de PDF de holerite.

A modelagem usa nomes técnicos em inglês e mantém equivalência com os conceitos de negócio:

| Negócio | Código | Responsabilidade |
|---|---|---|
| Competência da folha | `PayrollRun` | período de referência, status, processamento e fechamento |
| Holerite individual | `Payslip` | valores calculados por colaborador |
| Evento/rubrica | `PayrollEvent` | provento, desconto ou informativo usado no cálculo |
| Lançamento do holerite | `PayslipEntry` | item calculado/vinculado ao holerite |
| PDF do holerite | `PayslipPdfService` | demonstrativo de pagamento em PDF |

Não criar entidades paralelas como `CompetenciaFolha`, `FolhaPagamento` ou equivalentes.

---

## 2. Estado atual do código

### 2.1 Backend existente

Pacote atual: `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/`

Já existe:

- CRUD de `PayrollRun`: `/api/v1/payroll-runs`
- CRUD de `PayrollEvent`: `/api/v1/payroll-events`
- CRUD de `Payslip`: `/api/v1/payslips`
- CRUD de `PayslipEntry`: `/api/v1/payslip-entries`
- Processamento: `POST /api/v1/payroll-runs/{id}/process`
- Revisão: `POST /api/v1/payroll-runs/{id}/review`
- Fechamento: `POST /api/v1/payroll-runs/{id}/close`
- Reabertura: `POST /api/v1/payroll-runs/{id}/reopen`
- PDF: `GET /api/v1/payslips/{id}/pdf`

Componentes principais:

- `PayrollRunProcessingService`
- `PayrollRunLifecycleService`
- `PayrollRunStateMachine`
- `PayrollCalculationOrchestrator`
- `payroll/calculation/strategy/*`
- `payroll/integration/*Provider`
- `payroll/payslip/pdf/*`

### 2.2 Frontend existente

Pasta atual: `gommo-frontend/src/modules/ctb/payroll/`

Já existe:

- Rotas em `config/payroll.routes.ts`
- Lista/form de competência: `PayrollRunListClient`, `PayrollRunFormClient`
- Lista/form de eventos: `PayrollEventListClient`, `PayrollEventFormClient`
- Lista/form de holerites: `PayslipListClient`, `PayslipFormClient`
- DTOs, services, queries, mappers, exceptions e table columns por entidade

### 2.3 Funcionalidades já implementadas

- Cadastro de competências
- Cadastro de eventos/rubricas
- Cadastro/consulta de holerites
- Lançamentos por holerite
- Processamento por strategies
- Cálculo de salário base, INSS, FGTS, IRRF e rubricas parametrizáveis
- Status/lifecycle de competência
- Bloqueio de escrita para competência fechada/cancelada
- PDF de holerite com OpenPDF

---

## 3. Domínios e menus

O módulo **Folha de Pagamento** está no domínio **CTB / Contabilidade**.

O módulo **Pagamentos** permanece no domínio **DP / Departamento Pessoal**.

Essa separação aparece no frontend em `gommo-frontend/src/config/routes.ts`:

| Sistema | Módulos atuais |
|---|---|
| DP | Organização, Pagamentos |
| RH | Dashboard, Pessoas/RH, Insights |
| CTB | Folha de Pagamento |

---

## 4. Padrões de implementação

### 4.1 Backend

- Usar `BaseController`, `BaseService` e `IBaseRepository` para CRUD.
- Controllers filhos não redeclaram endpoints CRUD padrão.
- Endpoints específicos ficam no controller do agregado, chamando services próprios.
- RBAC fica no service com `@PreAuthorize`.
- DTOs são classes com Lombok, não records.
- Mappers são manuais e anotados como componentes.
- Toda alteração de schema usa Flyway em `gommo-backend/src/main/resources/db/migration/`.
- Soft delete via `status = DELETED`.
- Regras de negócio ficam em service/domain/lifecycle/calculation, nunca no controller.

### 4.2 Frontend

- Usar `tabbedCrudRoute` em `payroll.routes.ts`.
- Usar `{Entity}ListClient` e `{Entity}FormClient`.
- Services estendem `BaseService`.
- Query keys ficam em `*.query.ts`.
- Mappers manuais ficam em `lib/*.mapper.ts`.
- Table columns ficam em `config/*.table-columns.ts`.
- Exceptions e mensagens ficam em `exceptions/*.messages.ts`.
- Telas usam componentes compartilhados: `QueryTablePanel`, `CrudFormShell`, `FormSection`, inputs de `shared/components/ui/input`.

---

## 5. Regras de negócio relevantes

### 5.1 Status da competência

Fluxo principal:

```text
OPEN -> PROCESSING -> PROCESSED -> REVIEWED -> CLOSED
```

Status adicional:

```text
CANCELLED
```

Regras:

- `OPEN` e `PROCESSED` podem ser processados.
- `PROCESSED` pode ir para `REVIEWED`.
- `REVIEWED` pode ir para `CLOSED`.
- `CLOSED` pode ser reaberto.
- `CLOSED` e `CANCELLED` bloqueiam escrita.
- `PROCESSING` bloqueia edição enquanto o processamento ocorre.

### 5.2 Eventos/rubricas

Tipos:

- `EARNING`
- `DEDUCTION`
- `INFORMATIVE`

Incidências:

- INSS
- FGTS
- IRRF

Eventos podem ter fórmula parametrizável para o motor de cálculo.

### 5.3 Processamento

O processamento:

1. Valida se a competência pode ser processada.
2. Carrega eventos ativos.
3. Muda a competência para `PROCESSING`.
4. Obtém contratos, ponto e afastamentos via providers.
5. Executa `PayrollCalculationOrchestrator`.
6. Persiste ou atualiza `Payslip`.
7. Recria `PayslipEntry` via soft delete dos lançamentos antigos.
8. Marca competência como `PROCESSED`.

---

## 6. Multi-tenant

Novas tabelas de negócio relacionadas à folha devem seguir o checklist multi-tenant:

1. Criar migration Flyway no `gommo-backend`.
2. Incluir a tabela em `TenantSchemaTableCatalog.HR_DATA_TABLES` no admin backend.
3. Espelhar a tabela em `scripts/dev/seed-tenant-empresa-a.sql`.
4. Sincronizar tenants já provisionados em dev quando necessário.
5. Não filtrar tenant manualmente no service; usar `TenantSchemaDataSource` e contexto de tenant.

Tabelas atuais de folha já presentes no catálogo/seed:

- `payroll_run`
- `payroll_event`
- `payslip`
- `payslip_entry`

---

## 7. Organização de módulos

A organização de módulos espelha o caminho visual da sidebar na estrutura de pastas do frontend e backend.

Exemplo:

```text
dp/organization/department
dp/payment/...
rh/person/leave
ctb/payroll/payroll-run
ctb/payroll/payslip
```

Folha de Pagamento fica em:

```text
gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll
gommo-frontend/src/modules/ctb/payroll
```

Novos submódulos devem continuar seguindo o agrupamento da sidebar. Exemplo: `CTB > Folha de Pagamento > Holerites` deve permanecer sob `ctb/payroll/payslip`.

---

## 8. Pendências e dúvidas conhecidas

- Revisar providers em `payroll/integration`: hoje eles encapsulam integração com RH/DP e devem manter imports explícitos para os pacotes reorganizados.
- Revisar documentação antiga que ainda cita folha como DP.
- Validar se o lifecycle atual cobre todos os cenários operacionais de fechamento/reabertura.
- Evoluir cálculos legais conforme necessidade fiscal/contábil.

---

## 9. Referências de código

Backend:

- `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/controller/PayrollRunController.java`
- `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/service/PayrollRunProcessingService.java`
- `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/service/PayrollRunLifecycleService.java`
- `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/lifecycle/PayrollRunStateMachine.java`
- `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/calculation/`
- `gommo-backend/src/main/java/br/com/gommo/modules/ctb/payroll/payslip/pdf/`

Frontend:

- `gommo-frontend/src/config/routes.ts`
- `gommo-frontend/src/modules/ctb/payroll/config/payroll.routes.ts`
- `gommo-frontend/src/modules/ctb/payroll/components/PayrollRunListClient.tsx`
- `gommo-frontend/src/modules/ctb/payroll/payroll-event/components/PayrollEventListClient.tsx`
- `gommo-frontend/src/modules/ctb/payroll/payslip/components/PayslipListClient.tsx`
