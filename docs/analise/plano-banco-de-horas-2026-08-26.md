# Plano de Ação — Banco de Horas (cadastro, apuração e compensação) — 2026-08-26

> Documento de planejamento. Ainda **não implementado**.
> Substitui e detalha o item "Sprint 8 — Banco de horas + horas extras + aprovação"
> de `docs/analise/plano-execucao-sprints.md`.
> Depende do motor de ponto (Sprint 7). Ver "Pré-requisitos".

## 1. Objetivo

Permitir que o cliente **parametrize um ou mais bancos de horas**, que o sistema
**apure automaticamente crédito e débito** comparando o ponto batido com a escala
do colaborador, que o colaborador **solicite compensação**, e que o saldo tenha
**fechamento de período, integração com a folha, tratamento na rescisão e trilha
de auditoria imutável**.

O banco de horas não é um módulo isolado: ele é a camada de saldo em cima do
ponto. Por isso este plano assume que a apuração diária (jornada esperada x
jornada realizada) é a fonte única dos lançamentos.

## 2. Situação atual do sistema

Levantamento feito no código em 2026-08-26.

### 2.1 O que já existe e será reaproveitado

| Peça | Caminho | Observação |
|---|---|---|
| Ponto oficial | `gommo-backend/.../rh/person/attendance/entity/AttendanceRecord.java` | 1 registro por (colaborador, dia); já tem `expectedHours`, `workedHours`, `breakMinutes` e as flags `impactsHourBank` / `impactsPayroll` |
| Solicitação/ajuste | `.../attendance/entity/AttendanceRequest.java` | snapshot antes/depois, `reviewedAt/By/Reason`, idempotência por `clientRequestId` |
| Destino da compensação | `AttendanceCompensationTypeEnum` (`HOUR_BANK` / `OVERTIME`) + `V74__attendance_request_compensation_type.sql` | já é escolhido na aprovação de batida fora da escala |
| Aprovação | `AttendanceRecordService.review` / `applyApprovedRequest` / `applyCompensationDestination` | fluxo gestor → aprova/rejeita já existe, com `attendance:write` |
| Escala | `.../dp/organization/workschedule/entity/WorkSchedule.java` + `WorkScheduleDay.java` | dias da semana com `period1`/`period2`; horas esperadas do dia já são calculadas em `hoursForScheduleDay` |
| Vínculo escala ↔ colaborador | `AdmissionProcess.workScheduleId` / `workloadSchedule` | resolvido em `latestCompletedAdmission` |
| Afastamentos | `LeaveAbsenceRules.impactsHourBank` + `LeaveRequestService.syncAttendanceOccurrences` | já decide quais ausências debitam banco de horas |
| Folha | `ctb/payroll/integration/AttendanceHoursProviderImpl.java`, `calculation/strategy/OvertimeStrategy.java` | ponto de integração para pagar horas não compensadas |
| Parâmetros por chave | `SystemSetting` (padrão `ATTENDANCE_REQUIRE_PHOTO`) | serve para flags globais, **não** para o cadastro de banco de horas |
| Auditoria base | `core/entity/AuditEntity.java` | `createdBy/At`, `updatedBy/At`, soft delete por `StatusEnum.DELETED` |
| Notificações | `cfg/settings/notification/service/SystemNotificationService.java` | já notifica revisão de solicitação de ponto |
| Frontend ponto | `gommo-frontend/src/modules/dp/attendance/` | abas Ponto + Solicitações; modal de revisão já tem o seletor Banco de horas x Hora extra |

### 2.2 O que falta (e é pré-requisito real)

1. **Não existe saldo.** Hoje `impactsHourBank` é só um booleano no dia; nada
   acumula, nada extrata, nada expira.
2. **Não existe apuração por período.** O cálculo é linha a linha; nada agrega
   `workedHours − expectedHours` por ciclo.
3. **Não existe atraso, saída antecipada nem tolerância.** O enum
   `LATE_ARRIVAL` existe, mas sem cálculo. `minutesBetween` retorna 0 quando a
   saída é menor que a entrada, ou seja, **jornada que cruza a meia-noite não é
   suportada** (bloqueia 12x36 noturno).
4. **A escala é pobre demais para banco de horas.** `WorkSchedule` não tem carga
   diária/semanal declarada, tipo de escala, tolerância nem vigência; o intervalo
   é implícito (o buraco entre `period1` e `period2`).
5. **O vínculo da escala é frágil.** Vem da admissão `COMPLETED` mais recente;
   quem não tem admissão completa cai num fallback textual (`40h` → 8,00).
   Troca de escala no meio do contrato não tem histórico com vigência.
6. **Não existe calendário de feriados por tenant.** Só o utilitário estático
   `core/util/BrazilianBusinessCalendar.java` (feriados nacionais hardcoded), que
   o módulo de ponto sequer consome. Sem isso não há HE 100% em feriado.
7. **A folha está desconectada e hoje pagaria em dobro.**
   `AttendanceHoursProviderImpl` soma as horas direto do `attendance_record`
   **ignorando `impactsPayroll`, `impactsHourBank` e `compensationType`** — ou
   seja, hora mandada para o banco de horas também vira hora extra na folha.
   `OvertimeStrategy` calcula HE por diferença bruta mensal, com multiplicador
   único 1,5. **Isso é um bug a corrigir junto com este módulo.**
8. **Afastamento zera as horas do dia.** `syncAttendanceOccurrences` grava
   `expectedHours = null` e `workedHours = null`, o que impede calcular saldo de
   dia abonado.
9. **`requestStatus` é String livre** (`PENDING`/`APPROVED`/`REJECTED` como
   constantes no service), sem enum e sem tabela de transições.

## 3. Decisões de arquitetura (leitura crítica da especificação recebida)

A especificação enviada está correta no essencial. Os pontos abaixo são ajustes
ou complementos necessários para caber na arquitetura atual e na CLT.

### 3.1 O cadastro é entidade, não `SystemSetting`

A especificação pede múltiplos bancos coexistindo (administrativo x
operacional), com vigência e tipo de acordo. Isso não cabe no padrão
chave/valor de `SystemSetting`; será uma entidade CRUD normal
(`BaseController`/`BaseService`/`AuditEntity`), no módulo `dp/attendance`.

### 3.2 Vinculação: banco → colaborador precisa de regra explícita

A especificação cita "configuração por empresa, filial, sindicato ou cargo", mas
não define como o sistema escolhe **qual** banco vale para um colaborador. Proposta:

- uma tabela de **elegibilidade** (`hour_bank_assignment`) com escopo
  `COMPANY | DEPARTMENT | JOB_POSITION | COLLABORATOR`, com vigência;
- resolução por **especificidade decrescente**: colaborador > cargo >
  departamento > empresa;
- **um único banco ativo por colaborador por data**; conflito é erro de
  validação no cadastro, não desempate silencioso.

Filial e sindicato ficam fora do MVP porque **não existem como entidade hoje**
(o roteiro de gap registra "faltam unidade/filial, centro de custo"). O campo de
escopo já nasce preparado para recebê-los.

### 3.3 Tipo de banco: "Individual / Coletivo" é o tipo de **acordo**, não de saldo

Na CLT o que muda entre acordo individual e convenção/acordo coletivo é
principalmente o **prazo máximo de compensação** (6 meses no acordo individual
escrito, até 12 meses via norma coletiva; compensação dentro do mesmo mês é
admitida por acordo tácito). Então o campo será `agreementType`
(`INDIVIDUAL | COLLECTIVE`) e ele **valida** o `compensationPeriod`, em vez de
ser apenas informativo. O saldo é sempre por colaborador.

### 3.4 Limite diário de HE: separar limite legal de limite de banco

A CLT limita 2h extras/dia. O banco de horas não pode ser usado para legalizar
excedente. Portanto:

- `maxOvertimeHoursPerDay` (padrão 2h) com ação configurável
  (`BLOCK | REQUIRE_APPROVAL | PAY_EXCESS`), como pedido;
- quando a ação for `PAY_EXCESS`, o excedente **não entra no banco**: gera
  lançamento com destino `PAYROLL`, preservando a rastreabilidade.

### 3.5 O extrato é imutável de verdade

"Histórico imutável" será implementado como **livro-razão append-only**:
nenhum `UPDATE` de valor em `hour_bank_entry`. Correção vira lançamento de
estorno (`REVERSAL`) apontando para a entrada original. O saldo é derivado
(soma) e materializado por período para performance, nunca editado à mão.

Isso conflita com o item "RH pode editar" da especificação: RH **não edita**
lançamento; RH cria **ajuste manual** (`MANUAL_ADJUSTMENT`) com motivo
obrigatório, que é auditado.

### 3.6 Fechamento é operação explícita, com pré-visualização

"O sistema deve perguntar" vira: o fechamento é uma ação do RH que primeiro
mostra a **prévia** (quem tem saldo positivo vencendo, quem tem negativo, valor
em R$ estimado) e só depois aplica o destino. Fechamento aplicado é imutável;
reabrir exige justificativa e gera novo registro.

### 3.7 A folha só consome o que foi aprovado

Regra nova, para corrigir o bug atual: `AttendanceHoursProviderImpl` passa a
filtrar por `impactsPayroll = true` e a **excluir** horas destinadas ao banco.
As horas que a folha paga passam a vir de lançamentos de banco de horas com
destino `PAYROLL` (excedente, vencimento e rescisão), e não de uma diferença
bruta recalculada.

## 4. Modelo de dados proposto

Todas as tabelas em `gommo-backend` (schema do tenant), com migration Flyway
`V{n}__...` e inclusão obrigatória em `TenantSchemaTableCatalog` e no seed
`scripts/dev/seed-tenant-empresa-a.sql`.

### 4.1 `hour_bank` — cadastro/parametrização

| Campo | Tipo | Obrig. | Observação |
|---|---|---|---|
| `name` | varchar | sim | nome do banco |
| `status` | `StatusEnum` | sim | ACTIVE/INACTIVE/DELETED (cobre o "Ativo") |
| `agreement_type` | enum | sim | `INDIVIDUAL` / `COLLECTIVE` |
| `effective_from` | date | sim | data de início |
| `effective_to` | date | não | data de término |
| `compensation_period` | enum | sim | `MONTHLY` / `SEMIANNUAL` / `ANNUAL` / `CUSTOM` |
| `compensation_period_days` | int | condicional | obrigatório quando `CUSTOM` |
| `max_compensation_days` | int | sim | prazo máximo para compensar |
| `allows_negative_balance` | bool | sim | |
| `negative_balance_limit_minutes` | int | não | |
| `positive_balance_limit_minutes` | int | não | |
| `daily_tolerance_minutes` | int | não | tolerância diária |
| `compensation_method` | enum | sim | `AUTOMATIC` / `MANUAL` |
| `compensation_order` | enum | sim | `FIFO` / `LIFO` |
| `max_overtime_minutes_per_day` | int | sim | padrão 120 |
| `overtime_excess_action` | enum | sim | `BLOCK` / `REQUIRE_APPROVAL` / `PAY_EXCESS` |
| `positive_expiration_destination` | enum | sim | `PAY` / `TRANSFER` / `EXPIRE` |
| `negative_expiration_destination` | enum | sim | `DISCOUNT` / `TRANSFER` / `ZERO` |
| `expiration_alert_days` | int | não | alerta de saldo a vencer |

Validações: `effective_to > effective_from`; `INDIVIDUAL` não aceita período
maior que 6 meses; `COLLECTIVE` limitado a 12 meses; limite negativo só quando
`allows_negative_balance`.

### 4.2 `hour_bank_credit_rule` — o que entra e o que sai

Em vez de colunas booleanas fixas, uma linha por origem, com fator:

| Campo | Observação |
|---|---|
| `hour_bank_id` | |
| `source_type` | `OVERTIME_50`, `OVERTIME_100`, `HOLIDAY_WORK`, `NIGHT_SHIFT`, `ON_CALL`, `DUTY_SHIFT`, `LATE_ARRIVAL`, `EARLY_LEAVE`, `PARTIAL_ABSENCE` |
| `enabled` | bool |
| `direction` | `CREDIT` / `DEBIT` |
| `conversion_factor` | numeric — 1,0 (hora por hora) ou 1,5 / 2,0 quando o acordo converter |

Isso cobre os checkboxes da especificação (itens 2) sem engessar, e permite o
caso comum de acordo que credita hora extra 100% como 2h no banco.

### 4.3 `hour_bank_assignment` — elegibilidade

`hour_bank_id`, `scope` (`COMPANY|DEPARTMENT|JOB_POSITION|COLLABORATOR`),
`target_id`, `effective_from`, `effective_to`.

### 4.4 `hour_bank_entry` — movimentação (append-only)

`collaborator_id`, `hour_bank_id`, `reference_date`, `direction`
(`CREDIT`/`DEBIT`), `source_type`, `minutes`, `converted_minutes`,
`attendance_record_id` (origem no ponto), `compensation_request_id`,
`reversal_of_entry_id`, `status` (`PENDING`/`APPROVED`/`REJECTED`/`REVERSED`),
`approved_by`, `approved_at`, `expires_at`, `closing_id`, `notes`.

Saldo é `SUM(credit) − SUM(debit)` sobre `APPROVED`. `expires_at` vem do
`max_compensation_days` do banco vigente na data e é o que alimenta FIFO/LIFO e
os alertas.

### 4.5 `hour_bank_compensation_request` — solicitação de folga

`collaborator_id`, `target_date`, `requested_minutes`, `status`,
`manager_id`, `decided_at`, `decision_reason`. Ao aprovar, gera os
`hour_bank_entry` de débito consumindo créditos na ordem configurada.

### 4.6 `hour_bank_closing` — fechamento de período

`hour_bank_id`, `collaborator_id`, `period_start`, `period_end`,
`opening_balance_minutes`, `credited_minutes`, `debited_minutes`,
`closing_balance_minutes`, `destination` (`PAID`/`TRANSFERRED`/`EXPIRED`/
`DISCOUNTED`/`ZEROED`), `payroll_run_id`, `closed_by`, `closed_at`.

### 4.7 Auditoria

A especificação pede tabela genérica de auditoria (tabela afetada, registro,
usuário, data/hora, operação, valores antes/depois, motivo, IP). Como hoje só
existe `AuditEntity` (autor/data) e trilhas pontuais, proponho
`hour_bank_audit_log` **específica do módulo** no MVP, com o mesmo formato da
tabela genérica — assim ela pode ser promovida a trilha global depois sem
retrabalho de contrato. Campos: `entity_name`, `entity_id`, `operation`,
`old_value` (jsonb), `new_value` (jsonb), `reason`, `user_id`, `occurred_at`,
`ip_address`, `user_agent`.

### 4.8 Ajustes em tabelas existentes

- `work_schedule`: `daily_workload_minutes`, `weekly_workload_minutes`,
  `schedule_type` (`FIXED_5X2`, `SHIFT_12X36`, `FLEX`), `crosses_midnight`,
  `effective_from/to`.
- `collaborator_work_schedule` (nova): histórico de escala com vigência,
  substituindo a dependência exclusiva de `AdmissionProcess.workScheduleId`
  (a admissão passa a **criar** o primeiro vínculo).
- `attendance_record`: `late_minutes`, `early_leave_minutes`,
  `overtime_minutes`, `night_minutes`, `day_type`
  (`BUSINESS`/`REST`/`HOLIDAY`), `hour_bank_entry_id`.
- `holiday` (nova): `date`, `name`, `scope` (`NATIONAL`/`STATE`/`CITY`/
  `COMPANY`), com seed a partir de `BrazilianBusinessCalendar`.

## 5. Regras de negócio

### 5.1 Apuração diária (fonte dos lançamentos)

```text
escala_do_dia = escala vigente do colaborador na data (histórico com vigência)
horas_esperadas = soma dos períodos da escala no dia (0 em folga)
horas_trabalhadas = batidas pareadas − intervalo (suportando virada de meia-noite)

diferença = horas_trabalhadas − horas_esperadas

se |diferença| <= tolerância_diária  -> nenhum lançamento
se diferença > 0                     -> crédito (HE), classificado por tipo de dia
se diferença < 0                     -> débito (atraso / saída antecipada / falta parcial)
```

Classificação do crédito por `day_type`: dia útil → `OVERTIME_50`;
domingo/feriado/folga → `OVERTIME_100` ou `HOLIDAY_WORK`. O fator de conversão
sai de `hour_bank_credit_rule`.

Limite diário: se `overtime_minutes > max_overtime_minutes_per_day`, aplica
`overtime_excess_action`.

### 5.2 Ausências e afastamentos

- Atestado válido, férias, licenças legais: `workedHours = expectedHours`,
  **nenhum lançamento** no banco (mantém a regra já escrita em
  `plano-afastamentos-2026-06-24.md` e em `LeaveAbsenceRules`).
- Falta injustificada: débito conforme `hour_bank_credit_rule` ou desconto em
  folha, nunca os dois.
- Correção necessária: `syncAttendanceOccurrences` deve gravar `expectedHours` e
  `workedHours` em vez de `null`.

### 5.3 Compensação

Colaborador solicita folga → sistema valida saldo suficiente e limites →
gestor aprova (ou aprova automaticamente se `compensation_method = AUTOMATIC` e
houver saldo) → débito consome créditos em `FIFO`/`LIFO`, priorizando o que
vence antes quando FIFO.

### 5.4 Fechamento e vencimento

No fim do período (ou no vencimento individual do crédito):

| Situação | Destinos possíveis |
|---|---|
| Saldo positivo | pagar em folha (como HE com adicional), transferir para o próximo período, expirar |
| Saldo negativo | descontar em folha, transferir, zerar |

Expirar saldo positivo é juridicamente arriscado (a jurisprudência tende a
exigir pagamento); a opção existe, mas a UI deve exibir aviso e o motivo é
obrigatório.

### 5.5 Rescisão

Ao desligar (`Offboarding`): saldo positivo vira verba de horas extras na
rescisão com o adicional aplicável; saldo negativo gera desconto conforme
acordo, respeitando os limites legais de desconto. O fechamento de rescisão é
automático e não pode ser reaberto sem justificativa.

### 5.6 Perfis e permissões

Novo módulo `hourbank` no `PermissionModuleCatalog` (escopo DP), com:

| Authority | Quem usa |
|---|---|
| `hourbank:read` | colaborador (próprio saldo/extrato), gestor, RH |
| `hourbank:request` | colaborador — solicitar compensação |
| `hourbank:approve` | gestor — aprovar/rejeitar |
| `hourbank:write` | RH — ajuste manual, fechar período |
| `hourbank:config` | administrador — parametrizar bancos e regras |

O colaborador vê apenas o próprio extrato; o gestor vê a equipe. Como a noção de
"minha equipe" ainda é fraca no sistema, o MVP restringe por
departamento do colaborador.

## 6. Telas (frontend)

Seguindo `QueryTablePanel`/`DataTable` para listas e `CrudFormShell`/`FormSection`
para formulários, com `tabbedCrudRoute`.

1. **CFG > Banco de horas** — CRUD de banco, com seções: identificação e
   vigência, período e prazos, limites e tolerância, regras de crédito/débito
   (grid de origens), elegibilidade.
2. **DP > Ponto > Banco de horas** — extrato por colaborador (data, tipo,
   origem, horas, saldo acumulado, vencimento), com saldo antes/depois e filtro
   por período.
3. **DP > Ponto > Solicitações** — reaproveitar a tela atual, somando a aba de
   solicitações de compensação (folga).
4. **DP > Ponto > Fechamento** — prévia + aplicação do destino do saldo.
5. **Dashboard** — saldo total da empresa, maiores saldos positivos/negativos,
   horas a vencer nos próximos N dias.
6. **Autoatendimento do colaborador** — saldo e extrato somente leitura, e o
   botão de solicitar folga.

## 7. Relatórios

Banco de horas por colaborador; saldo consolidado da empresa; horas a vencer;
horas expiradas; horas pagas; histórico de alterações; extrato detalhado;
auditoria. Todos derivam de `hour_bank_entry` + `hour_bank_closing`, sem cálculo
paralelo.

## 8. Alertas e notificações

Via `SystemNotificationService`: saldo próximo do vencimento
(`expiration_alert_days`), estouro do limite diário de HE, saldo negativo acima
do limite, solicitação de compensação pendente de aprovação, período pronto para
fechamento.

## 9. Pré-requisitos (ordem obrigatória)

Este módulo **não deve começar** antes de:

1. **Escala estruturada com vigência** — carga diária/semanal, tolerância, tipo
   de escala, virada de meia-noite, e histórico `collaborator_work_schedule`
   alimentado pela admissão.
2. **Motor de apuração diária** — atraso, saída antecipada, HE por tipo de dia,
   noturno real.
3. **Calendário de feriados por tenant** — sem isso não existe HE 100%.

Sem (1) e (2) o banco de horas vira apenas um lançador manual de horas, que é
exatamente o que se quer evitar.

## 10. Faseamento sugerido

| Fase | Escopo | Resultado |
|---|---|---|
| F0 | Escala estruturada + histórico com vigência + feriados | base confiável de jornada |
| F1 | Motor de apuração diária (atraso, saída antecipada, HE 50/100, tolerância) | `attendance_record` com minutos classificados |
| F2 | Cadastro `hour_bank` + regras + elegibilidade + permissões | parametrização utilizável |
| F3 | `hour_bank_entry` (livro-razão) + geração automática pela apuração + extrato | saldo real e auditável |
| F4 | Solicitação de compensação + aprovação + FIFO/LIFO | ciclo completo do colaborador |
| F5 | Fechamento de período + vencimento + integração com folha (corrigindo `AttendanceHoursProviderImpl`) | saldo com destino financeiro |
| F6 | Rescisão + relatórios + dashboard + alertas | fechamento do módulo |

## 11. Riscos

- **Pagamento em duplicidade**: enquanto `AttendanceHoursProviderImpl` ignorar
  `impactsPayroll`/`compensationType`, hora enviada ao banco também é paga. É o
  risco mais crítico e deve ser corrigido junto com F3, não em F5.
- **Escala inexistente ou desatualizada**: colaborador sem admissão `COMPLETED`
  cai no fallback textual e a apuração fica errada silenciosamente. Precisa de
  validação e alerta.
- **Escopo**: o motor de ponto é maior que o banco de horas em si; o roteiro de
  sprints já registra esse risco. Manter F0/F1 com MVP enxuto.
- **Jurídico**: prazos e destinos de saldo variam por convenção coletiva; as
  regras precisam ser todas parametrizadas, nunca hardcoded.
- **Multi-tenant**: cada tabela nova precisa entrar em
  `TenantSchemaTableCatalog` e no seed, ou quebra em tenants existentes.

## 12. Critérios de aceite

- Administrador cadastra dois bancos com regras distintas e cada colaborador
  resolve exatamente um banco vigente.
- Batida acima da jornada gera crédito classificado por tipo de dia, respeitando
  tolerância e limite diário.
- Atraso e saída antecipada geram débito; atestado válido e férias não geram
  nada.
- Colaborador solicita folga, gestor aprova, saldo é debitado na ordem
  configurada e o extrato mostra saldo antes e depois.
- Hora destinada ao banco **não** aparece como hora extra na folha.
- Fechamento aplica o destino escolhido e o resultado é imutável.
- Desligamento calcula saldo positivo como verba rescisória e negativo como
  desconto.
- Toda alteração de saldo tem usuário, data/hora, valor anterior, valor novo e
  motivo.

## 13. Pontos a confirmar com o negócio

1. Filial e sindicato como escopo de elegibilidade: fora do MVP (entidades não
   existem) — confirmar.
2. Conversão de HE 100% no banco: hora por hora ou 1h trabalhada = 2h de
   crédito? Proposta é deixar parametrizável por `conversion_factor`.
3. Expiração de saldo positivo sem pagamento: manter a opção mesmo com o risco
   jurídico?
4. Aprovação automática quando há saldo (`compensation_method = AUTOMATIC`)
   dispensa o gestor ou apenas pré-aprova?
5. Gestor enxerga a equipe por departamento (proposta do MVP) ou é necessário
   um vínculo explícito de gestor/subordinado?
