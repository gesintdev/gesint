# Análise de Gap — Roteiro "Ciclo completo de vida de uma colaboradora"

> Documento de análise (somente leitura/planejamento). Não houve alteração de código.
> Base: `Roteiro_Gommo_Ciclo_Colaborador.pdf` v1.0 (data-base 22/06/2026) x estado atual do monorepo.
> Objetivo: mapear, etapa por etapa, **o que já existe e funciona**, **o que existe parcialmente** e **o que ainda não existe**, para planejar os próximos passos.

## Legenda de status

| Marcador | Significado |
|---|---|
| OK | Existe e atende o requisito |
| PARCIAL | Existe parcialmente / com lacuna relevante |
| FALTA | Não existe |

---

## 1. Sumário executivo

O Gommo hoje é forte em **fundação multi-tenant** e em **CRUDs de cadastro** (colaborador, contrato, admissão, departamento, cargo, eventos de folha, holerite com PDF). O roteiro do PDF, porém, exige um sistema com **motores de regra de negócio** (apuração de ponto, vigência/histórico funcional, cálculo legal de folha por competência, férias, 13º, rescisão) e **governança** (auditoria com motivo, fechamento imutável, privacidade LGPD). É exatamente nessa camada de "motor" e "governança" que estão as maiores lacunas.

### Maturidade por domínio do roteiro

| Domínio do roteiro | Maturidade | Resumo |
|---|---|---|
| Tenant / Onboarding cliente | PARCIAL ~70% | Control plane e provisionamento por schema existem; falta seed automático de `company`, plano->módulos, onboarding self-service |
| Organização (depto/cargo) | PARCIAL ~60% | Departamento e cargo OK; faltam unidade/filial, centro de custo como entidade, organograma, calendário/feriados cadastráveis |
| Pessoa / Colaborador / Prontuário | PARCIAL ~40% | Colaborador e admissão existem; faltam dependentes, dados bancários, prontuário, histórico funcional com vigência |
| Contrato / Período de experiência | PARCIAL ~35% | Contrato existe; **experiência 45+45, prorrogação e efetivação não existem**; menu de contrato não exposto |
| Ponto / Jornada | FALTA ~20% | Só CRUD de marcação; sem jornada estruturada, apuração, banco de horas, tolerância, HE 100% |
| Folha de pagamento | PARCIAL ~45% | Competência, processamento, holerite PDF, INSS/IRRF/FGTS existem mas **hardcoded**; faltam proporcional admissão, VT/VA/DSR, parametrização por competência |
| Benefícios | PARCIAL ~40% | CRUD plano + vínculo OK; **sem dependentes, sem integração com folha, sem relatório de custo** |
| Afastamentos | PARCIAL ~30% | `LeaveRequest` genérico com anexo; sem distinção curto x previdenciário, CID protegido, retorno, LGPD |
| Férias | PARCIAL ~50% | Domínio CLT (aquisitivo/concessivo/fracionamento) parcial; **sem recibo, sem integração ponto/folha, sem etapa do gestor** |
| 13º salário | FALTA 0% | Não existe |
| Rescisão / Desligamento | FALTA ~15% | Só registro administrativo (`Offboarding`); **sem verbas, TRCT, checklist, bloqueio de acesso** |
| Ocorrências / Disciplinar | FALTA ~10% | Só avaliação de desempenho; sem advertência/ocorrência com visibilidade restrita |
| Auditoria | FALTA ~15% | `AuditEntity` (created/updated) existe; **tabela `audit_log` órfã, sem trilha consultável, sem motivo** |
| Relatórios / Dashboard | PARCIAL ~25% | Dashboard operacional existe; **sem absenteísmo, turnover, custos, headcount por período, exportação** |
| eSocial | FALTA 0% | Nenhum mapeamento (aceitável para MVP, mas modelo precisa nascer preparado) |
| Documentos / Templates | PARCIAL ~20% | Storage de anexos + PDF de holerite; **sem modelos de documento, geração, assinatura** |

---

## 2. Cadastros mestres (Fase 0 — Dez/2025)

O roteiro exige a estrutura mínima antes da primeira admissão.

| Cadastro exigido | Status | Onde está / o que falta |
|---|---|---|
| Cliente / Tenant / CNPJ / subdomínio | OK | `admin.client` + `ClientController` + tela `/clients` (admin) |
| Plano contratado / módulos ativos | PARCIAL | Assinatura (`ClientSubscription`) existe; **menus por plano (`client permissions`) está "coming soon"** |
| Usuário administrador do cliente | OK | `TenantUserProvisioner` cria `app_user` + role admin no schema |
| Domínio/subdomínio por cliente | OK | `routingMode` + `subdomain`/`customDomain`; resolver por host + `X-Tenant-Slug` |
| Unidade Matriz Goiânia | FALTA | **Não existe entidade de unidade/filial/estabelecimento** |
| Departamento DP | OK | `Department` + CRUD + tela `/organization/departments` |
| Cargo | OK | `JobPosition` + CRUD + tela `/organization/job-positions` |
| Centro de custo DP-001 | PARCIAL | Só campo texto `costCenter` em `Department`; **não há entidade `cost_center`** |
| Calendário 2026 + feriados | PARCIAL | Feriados nacionais **hardcoded** (`VacationRules`, `brazil-calendar.ts`); **sem cadastro, sem municipais/estaduais, sem calendário por unidade** |
| Eventos básicos de folha (salário, INSS, FGTS, IRRF, VT, VA, HE, faltas, DSR, férias, 13º, rescisão) | PARCIAL | Seed tem `SAL_BASE`, `HORA_EXTRA`, `ADIC_NOTURNO`, `INSALUBRIDADE`, `PERICULOSIDADE`, `INSS`, `IRRF`, `FGTS`. **Faltam VT, VA, DSR, FALTAS, FÉRIAS, 13º, RESCISÃO** |
| Eventos de folha com vigência por competência | FALTA | `PayrollEvent` não tem vigência; tabelas tributárias hardcoded; `TaxObligation` tem vigência mas **não alimenta o cálculo** |
| Empresa (CNPJ empregador) cadastrável no ERP | PARCIAL | `Company` + API existem, mas **sem item de menu** no ERP; `/company` redireciona; seed só manual em dev |

**Backlog Fase 0:** entidade `Unidade/Estabelecimento`; entidade `CentroCusto`; cadastro de calendário/feriados; vigência em eventos de folha; parâmetros tributários globais por competência; tela de empresa no ERP; seed automático de `company` no provisionamento; módulos por plano.

---

## 3. Linha do tempo — análise mês a mês

### Mês 1 — Jan/2026 — Admissão da Mariana

| Requisito | Status | Observação |
|---|---|---|
| Cadastrar pessoa física e colaboradora | PARCIAL | `Collaborator` é a própria pessoa física; criação **só via admissão** |
| Documentos, endereço, dados bancários, contato emergência, anexos | PARCIAL | Endereço, contato e anexos existem na admissão. **Dados bancários FALTA. Contato de emergência não migra para o colaborador** |
| Contrato CLT com cargo, salário, jornada, experiência 45+45 | PARCIAL | Contrato existe; **experiência 45+45 FALTA**; `departmentId` e `workloadSchedule` não ficam no contrato |
| Ativar VT e VA desde a admissão | PARCIAL | `BenefitEnrollment` existe; **não há vínculo automático na admissão** |
| Checklist admissional + documentos | PARCIAL | Checklist por **etapa** (6 passos), não por documento; sem status aprovado/pendente por doc |
| Evento de admissão p/ eSocial futuro | FALTA | Sem qualquer mapeamento eSocial (S-2200) |
| Status Ativa | PARCIAL | `StatusEnum` = ACTIVE/INACTIVE/DELETED; sem status funcional derivado de eventos |
| Contrato no histórico funcional | FALTA | **Não há histórico funcional** que preserve o passado |
| Folha proporcional de janeiro (dias) | FALTA | `BaseSalaryStrategy` paga salário integral; **ignora data de admissão** |
| Impedir admissão sem campos obrigatórios | PARCIAL | Validação CLT vs PJ existe; sem regras para aprendiz/estagiário/intermitente |

**Lacunas-chave:** dados bancários, vínculo de benefício na admissão, período de experiência, prontuário, histórico funcional, folha proporcional.

### Mês 2 — Fev/2026 — Primeira folha cheia

| Requisito | Status | Observação |
|---|---|---|
| Importar/registrar marcações de ponto | PARCIAL | `AttendanceRecord` CRUD manual (1 entrada/1 saída por dia); sem importação |
| Apurar jornada sem faltas | FALTA | **Não há motor de apuração** confrontando ponto x jornada |
| Folha com salário integral + descontos legais + VT + VA | PARCIAL | Salário, INSS, IRRF, FGTS calculam; **VT e VA não entram na folha** |
| Holerite + competência fechada | OK | `Payslip` + PDF (OpenPDF) + lifecycle `CLOSED` com bloqueio de escrita |
| Folha fechada exige reabertura controlada | PARCIAL | Reabertura existe, mas **sem justificativa/motivo obrigatório nem trilha** |
| Holerite reflete rubricas e bases | OK | `PayslipEntry` com quantidade/valor; PDF detalha |
| Ponto aprovado alimenta folha | PARCIAL | Só HE e adicional noturno via heurística; **sem aprovação de ponto** |
| Relatório mensal por centro de custo | FALTA | **Não existe relatório por CC/departamento** |

### Mês 3 — Mar/2026 — Experiência e feedback

| Requisito | Status | Observação |
|---|---|---|
| Avaliação simples do período de experiência | PARCIAL | `PerformanceReview` existe, mas não vinculado a experiência |
| Prorrogar experiência até 90 dias | FALTA | **Sem conceito de período de experiência/prorrogação** |
| Anexar termo de prorrogação | PARCIAL | Storage genérico existe; sem template de documento |
| Alerta antes de vencer a experiência | FALTA | **Sem agenda de alertas** |
| Histórico mostra início, prorrogação, fim | FALTA | Sem histórico funcional |
| Permissão impede usuário comum de alterar contrato | PARCIAL | RBAC `contract:*` existe; sem escopo por hierarquia |

### Mês 4 — Abr/2026 — Fim da experiência e plano de saúde

| Requisito | Status | Observação |
|---|---|---|
| Alterar contrato p/ prazo indeterminado (efetivação) | PARCIAL | Edição de contrato existe, mas **sobrescreve** (sem evento de efetivação no histórico) |
| Ativar plano de saúde com vigência em abril | OK | `BenefitEnrollment` com `startDate`/`endDate` |
| Desconto de mensalidade/coparticipação | FALTA | **Benefício não gera desconto/custo na folha** |
| Benefício não retroage | OK | Vigência por data no enrollment |
| Folha de abril traz custo do plano | FALTA | Sem integração benefícios -> folha |
| Relatório de custo por colaboradora | FALTA | Não existe |

### Mês 5 — Mai/2026 — Horas extras e banco de horas

| Requisito | Status | Observação |
|---|---|---|
| Registrar marcações extras | PARCIAL | CRUD de ponto; sem múltiplas batidas |
| Apurar HE por tipo de dia (50% útil, 100% domingo/feriado) | PARCIAL | `OvertimeStrategy` só **50% genérico**; **sem 100% domingo/feriado** |
| Separar pagamento em folha ou banco de horas | FALTA | **Banco de horas não existe** |
| Aprovar exceções pelo gestor | FALTA | Sem workflow de aprovação de ponto |
| Aprovação deixa trilha de auditoria | FALTA | Sem trilha consultável |
| Banco de horas mostra saldo antes/depois | FALTA | Não existe |

### Mês 6 — Jun/2026 — Atestado curto

| Requisito | Status | Observação |
|---|---|---|
| Registrar atestado de 3 dias com anexo | PARCIAL | `LeaveRequest` tipo `MEDICAL` + anexo storage |
| Abonar período no ponto | FALTA | **Sem integração afastamento -> ponto** |
| Folha sem desconto de falta | PARCIAL | Só `UNPAID` desconta; médico não desconta (mas por ausência de regra, não por tratamento) |
| Tipo de afastamento em histórico | PARCIAL | `LeaveTypeEnum` genérico (5 tipos) |
| Documento médico protegido por permissão | FALTA | Storage com permissão global `storage:*`; **sem privacidade de doc sensível** |
| Relatório de absenteísmo | FALTA | Dashboard conta leave por tipo; **sem relatório de absenteísmo** |

### Mês 7 — Jul/2026 — Promoção e alteração salarial

| Requisito | Status | Observação |
|---|---|---|
| Alterar cargo e salário com motivo "Promoção" | FALTA | Edição sobrescreve; **sem campo motivo, sem evento de alteração** |
| Vigência a partir de 01/07/2026 | FALTA | **Sem motor de vigência** para salário/cargo |
| Folhas anteriores mantêm R$ 4.800 | PARCIAL | Possível se criar novo contrato manualmente; não há mecanismo dedicado |
| Folha de julho usa R$ 5.600 | PARCIAL | Depende de `findActiveForPeriod` em contrato; frágil |
| Histórico exibe cargo/salário antigo e novo | FALTA | **Sem histórico funcional** |
| Documento de alteração contratual | FALTA | Sem template/geração |
| Evento eSocial S-2206 futuro | FALTA | Sem mapeamento |

**Lacuna estrutural mais crítica do roteiro:** motor de vigência + histórico funcional. Vários meses (4, 7, 16) dependem dele.

### Mês 8 — Ago/2026 — Dependente em benefício

| Requisito | Status | Observação |
|---|---|---|
| Cadastrar dependente para benefício | FALTA | **Dependentes não existem em nenhum lugar** |
| Anexar documentos do dependente | FALTA | Sem entidade de dependente |
| Ativar dependente com vigência | FALTA | — |
| Lançar desconto/custo na folha | FALTA | Sem integração benefícios -> folha |
| Histórico de benefício titular + dependente | FALTA | — |
| Relatório empresa x colaboradora | FALTA | — |

### Mês 9 — Set/2026 — Afastamento médico longo (20 dias)

| Requisito | Status | Observação |
|---|---|---|
| Afastamento de 20 dias com tipo, CID protegido, documento | PARCIAL | `LeaveRequest` + anexo; **sem campo CID, sem proteção** |
| Diferenciar atestado curto x afastamento longo previdenciário | FALTA | **Sem regra de primeiros 15 dias empresa / restante INSS** |
| Apurar impacto no ponto | FALTA | Sem integração |
| Simular integração eSocial (S-2230) | FALTA | Sem mapeamento |
| Folha com tratamento do período afastado | PARCIAL | Só licença `UNPAID` afeta salário base |
| Retorno previsto agendado | FALTA | Sem agendamento/alerta |
| Permissões restringem info médica | FALTA | Sem LGPD para anexos médicos |

### Mês 10 — Out/2026 — Retorno ao trabalho

| Requisito | Status | Observação |
|---|---|---|
| Registrar retorno em 01/10 | FALTA | **Sem evento/workflow de retorno** |
| Reativar jornada normal | FALTA | Sem máquina de status funcional |
| Folha de outubro sem rubrica indevida | PARCIAL | Depende da data fim do leave |
| Alerta de pendências/documentos | FALTA | Sem alertas |
| Status volta para Ativa | FALTA | Sem status funcional derivado de eventos |
| Headcount trata afastada x ativa | FALTA | Dashboard só conta ativos simples |

### Mês 11 — Nov/2026 — 1ª parcela do 13º

| Requisito | Status | Observação |
|---|---|---|
| Abrir processamento de 13º 1ª parcela | FALTA | **13º não existe** |
| Calcular avos proporcionais | FALTA | — |
| Recibo separado / evento na folha | FALTA | Sem tipo de folha 13º |
| Marcar pagamento | FALTA | — |
| Relatório separa folha mensal x 13º | FALTA | — |

### Mês 12 — Dez/2026 — 2ª parcela do 13º + fechamento anual

| Requisito | Status | Observação |
|---|---|---|
| Processar 2ª parcela do 13º (desconta a 1ª) | FALTA | 13º inexistente |
| Fechar folha mensal de dezembro | OK | Lifecycle `CLOSED` |
| Conferir bases INSS/FGTS/IRRF (mensal e 13º) | PARCIAL | Mensal sim (hardcoded); 13º FALTA |
| Competências fechadas bloqueiam alteração | OK | `PayrollRunLockService` |
| Dashboard custo anual da colaboradora | FALTA | Sem analytics de custo |
| Fechamento anual | FALTA | Sem processo de fechamento anual |

### Mês 13 — Jan/2027 — Período aquisitivo de férias completo

| Requisito | Status | Observação |
|---|---|---|
| Gerar período aquisitivo 05/01/26–04/01/27 | PARCIAL | Cálculo em tempo real (`VacationRules`, `VacationEligibilityEvaluator`); **não persistido** |
| Calcular saldo de férias | PARCIAL | Cálculo em tempo real; sem saldo persistido por período |
| Solicitar férias p/ março/2027 | OK | `LeaveRequest` tipo `VACATION` |
| Workflow gestor + RH | PARCIAL | Fluxo **RH -> DP** apenas; **sem etapa do gestor** |
| Não liberar antes da aquisição | PARCIAL | Validação existe; concessivo parcial |
| Saldo considera faltas/afastamentos | PARCIAL | `VacationAbsenceCalculator` conta faltas; art. 130 parcial |

### Mês 14 — Fev/2027 — Programação e pagamento de férias

| Requisito | Status | Observação |
|---|---|---|
| Programar 20 dias | OK | `LeaveRequest` com período + fracionamento 14/5/5 |
| Recibo de férias com 1/3 | PARCIAL | **Estimativa só na UI** (`VacationPaymentSummary`); **sem recibo/documento, sem evento na folha** |
| Gerar aviso/recibo | FALTA | Sem geração de documento |
| Bloquear ponto no período | FALTA | **Sem integração férias -> ponto** |
| Calendário do colaborador mostra férias futuras | FALTA | Sem calendário individual |
| Recibo usa salário vigente | PARCIAL | `baseSalarySnapshot` existe; médias art. 142 FALTA |
| Evitar sobrepor férias com afastamento | PARCIAL | Validações de data; verificar conflito cross-tipo |

### Mês 15 — Mar/2027 — Gozo de férias e retorno

| Requisito | Status | Observação |
|---|---|---|
| Registrar gozo | PARCIAL | Aprovação no `LeaveRequest`; sem estado "em gozo" |
| Apurar ponto só nos dias trabalhados | FALTA | Sem integração |
| Fechar folha considerando férias | FALTA | `LeaveDataProvider` ignora `VACATION` |
| Atualizar saldo remanescente | PARCIAL | Cálculo em tempo real; sem extrato persistido |
| Férias não geram falta | PARCIAL | Depende de integração ausente |
| Folha não duplica valores do recibo | FALTA | Sem recibo/integração |

### Mês 16 — Abr/2027 — Movimentação interna (mudança de departamento)

| Requisito | Status | Observação |
|---|---|---|
| Alterar departamento e CC com vigência 01/04 | FALTA | **Sem `departmentId` no contrato, sem vigência de lotação** |
| Atualizar gestor imediato | FALTA | Sem entidade de gestor no contrato |
| Validar permissões do novo departamento | FALTA | RBAC não é por departamento |
| Histórico preserva antiga lotação | FALTA | Sem histórico de lotação |
| Relatórios dividem meses (DP até mar, RH a partir de abr) | FALTA | Sem relatório por período/lotação |
| Folha usa novo CC | FALTA | CC não usado na folha |

### Mês 17 — Mai/2027 — Advertência e performance

| Requisito | Status | Observação |
|---|---|---|
| Criar ocorrência funcional | FALTA | **Sem entidade de ocorrência/disciplinar** |
| Anexar documento/observação | PARCIAL | Storage genérico |
| Visibilidade restrita a RH/gestores | FALTA | Sem flag de confidencialidade |
| Registrar ciência (assinatura) | FALTA | Sem assinatura/aceite |
| Ocorrência não aparece para sem permissão | FALTA | — |
| Auditoria quem criou/alterou | PARCIAL | `AuditEntity` created/updated; sem trilha consultável |
| Relatório de ocorrências | FALTA | — |

### Mês 18 — Jun/2027 — Desligamento sem justa causa

| Requisito | Status | Observação |
|---|---|---|
| Abrir processo de rescisão | PARCIAL | Só registro `Offboarding` (data, tipo, notas) |
| Verbas: saldo salário, férias vencidas/proporcionais, 13º proporcional, descontos | FALTA | **Sem cálculo de verbas rescisórias** |
| Aviso prévio (trabalhado/indenizado) | FALTA | Não existe |
| Multa/FGTS rescisória | FALTA | `FgtsStrategy` só calcula depósito mensal |
| Gerar TRCT, demonstrativo de verbas | FALTA | Sem TRCT |
| Status Desligada | FALTA | Sem status; offboarding não toca `Collaborator` |
| Bloquear acessos e preservar prontuário | FALTA | Offboarding não toca `AppUser` |
| Folhas futuras não incluem Mariana | FALTA | Sem exclusão automática |
| Histórico completo consultável | PARCIAL | Registros persistem; sem visão consolidada |
| Reabertura/retificação exige permissão + justificativa | FALTA | Sem justificativa |
| Checklist demissional | FALTA | Não existe |
| Indicadores de turnover | FALTA | Não existe |

---

## 4. Matriz de casos de teste consolidados (TC-001 a TC-014)

| ID | Cenário | Status | Bloqueadores principais |
|---|---|---|---|
| TC-001 | Criar cliente/tenant | PARCIAL | Falta módulos por plano; seed `company` automático |
| TC-002 | Admitir colaboradora | PARCIAL | Dados bancários, benefício na admissão, experiência 45+45 |
| TC-003 | Fechar folha mensal | PARCIAL | Reabertura sem justificativa; VT/VA fora da folha |
| TC-004 | Apurar ponto | FALTA | Sem motor de apuração, banco de horas, HE 100% |
| TC-005 | Alterar cargo/salário | FALTA | **Sem motor de vigência / histórico funcional** |
| TC-006 | Gerenciar benefícios | PARCIAL | Dependentes, integração com folha, relatório de custo |
| TC-007 | Atestado/afastamento | PARCIAL | CID protegido, regra curto x longo, abono no ponto, LGPD |
| TC-008 | Calcular 13º | FALTA | **Inexistente** |
| TC-009 | Controlar férias | PARCIAL | Recibo, integração ponto/folha, etapa gestor |
| TC-010 | Desligar colaboradora | FALTA | Verbas, TRCT, status, bloqueio de acesso |
| TC-011 | Auditoria histórica | FALTA | `audit_log` órfão; sem motivo; sem trilha |
| TC-012 | Permissões | PARCIAL | RBAC por módulo OK; falta escopo por depto/sensibilidade |
| TC-013 | Relatórios | FALTA | Sem absenteísmo/turnover/custos/headcount por período |
| TC-014 | Integrações futuras (eSocial) | FALTA | Modelo ainda não preparado para mapear eventos |

---

## 5. Mapa de entidades — candidatas x existentes

| Domínio | Entidades sugeridas pelo roteiro | Existentes no Gommo | Faltantes |
|---|---|---|---|
| Cliente/Tenant | empresa_cliente, unidade, configuracao_cliente, dominio_cliente, modulo_contratado | `admin.client`, `client_subscription`, routing fields | unidade, modulo_contratado (por plano) |
| Organização | departamento, cargo, centro_custo, gestor, hierarquia | `Department` (com `parentId`, `costCenter` texto), `JobPosition` | `cost_center`, `gestor`, organograma, unidade |
| Pessoa/Colaborador | pessoa_fisica, colaborador, documento_pessoa, endereco, contato_emergencia, dado_bancario | `Collaborator`, `CollaboratorAddress`, `CollaboratorContact` | documento_pessoa, contato_emergencia (persistido), **dado_bancario**, **dependente** |
| Contrato | contrato_trabalho, historico_funcional, salario_historico, jornada_historico, lotacao_historico | `EmploymentContract`, `ContractRecessPolicy/Period` (PJ) | **historico_funcional**, salario/jornada/lotacao_historico, experiência |
| Ponto | jornada_trabalho, marcacao_ponto, espelho_ponto, apuracao_ponto, banco_horas, ocorrencia_ponto | `AttendanceRecord` | jornada estruturada, espelho, apuração, banco_horas, ocorrência |
| Benefícios | beneficio, plano_beneficio, colaborador_beneficio, dependente, beneficio_dependente | `BenefitPlan`, `BenefitEnrollment` | dependente, beneficio_dependente, catálogo de tipos |
| Folha | competencia_folha, tipo_folha, rubrica, lancamento_folha, calculo_folha, holerite, parametro_tributario | `PayrollRun`, `PayrollEvent`, `PayslipEntry`, `Payslip`, `TaxObligation` | **tipo_folha**, parametro_tributario aplicado por competência |
| Férias | periodo_aquisitivo, solicitacao_ferias, recibo_ferias, saldo_ferias | `LeaveRequest` (VACATION) + domínio | periodo_aquisitivo persistido, **recibo_ferias**, saldo_ferias persistido |
| Afastamentos | tipo_afastamento, afastamento, documento_afastamento, retorno_afastamento | `LeaveRequest` (MEDICAL etc.) | tipo_afastamento (catálogo), **retorno_afastamento**, CID |
| Rescisão | processo_rescisao, verba_rescisoria, documento_rescisorio, checklist_demissional | `Offboarding`, `ExitInterview` | **verba_rescisoria**, **documento_rescisorio (TRCT)**, checklist |
| Documentos | modelo_documento, documento_gerado, anexo_prontuario, assinatura_documento | `StorageObject`, `StorageObjectLink` | **modelo_documento**, documento_gerado, assinatura |
| Auditoria | auditoria_evento, trilha_alteracao, justificativa_reabertura, log_integracao | `AuditEntity` (campos), tabela `audit_log` (órfã) | **trilha consultável**, justificativa_reabertura, log_integracao |

---

## 6. Backlog priorizado para atender a história

Priorização alinhada ao PDF (P0 fundação, P1 DP operacional, P2 integrações), ordenada por dependência.

### P0 — Fundação que destrava o maior número de meses

1. **Motor de vigência + histórico funcional** (`historico_funcional`, `salario_historico`, `lotacao_historico`, `jornada_historico`) — destrava Meses 3, 4, 7, 16 e TC-005. **Maior alavanca do roteiro.**
2. **Período de experiência 45+45 + efetivação + alertas** — Meses 1, 3, 4.
3. **Folha proporcional de admissão** — Mês 1.
4. **Parametrização tributária por competência** (INSS/IRRF/FGTS por vigência, ligar `TaxObligation`/tabela ao motor) — toda a folha.
5. **Tipo de folha + governança de fechamento com justificativa + trilha de auditoria consultável** (`audit_log` operacional) — Meses 2, 11, 12, 18 e TC-003/TC-011.
6. **Dados bancários do colaborador** — Mês 1.

### P0/P1 — RH essencial

7. **13º salário** (tipo de folha, avos, 1ª/2ª parcela, bases) — Meses 11, 12, TC-008.
8. **Motor de apuração de ponto + jornada estruturada + banco de horas + HE 50%/100%** — Meses 2, 5, 6, 10, TC-004.
9. **Rescisão completa** (verbas, aviso prévio, multa FGTS, TRCT, status Desligada, bloqueio de acesso, remoção de folhas futuras) — Mês 18, TC-010.
10. **Afastamentos com regras** (curto x previdenciário, retorno, abono no ponto, CID protegido/LGPD) — Meses 6, 9, 10, TC-007.
11. **Recibo de férias + integração férias -> ponto -> folha + etapa do gestor** — Meses 13, 14, 15, TC-009.

### P1 — DP operacional

12. **Dependentes** (com finalidades: IRRF, salário-família, benefício, emergência) — Mês 8.
13. **Benefícios -> folha** (VT, VA, desconto/custo por competência) + relatório de custo — Meses 2, 4, 8.
14. **Prontuário digital** com permissão diferenciada para docs sensíveis — Meses 1, 17.
15. **Ocorrências/disciplinar** com visibilidade restrita — Mês 17.
16. **Status funcional derivado de eventos** (Ativa/Afastada/Férias/Desligada) + alertas — Meses 10, 18.
17. **Relatórios gerenciais** (headcount por período/status, absenteísmo, turnover, custos, folha por CC) — TC-013.
18. **Cadastros estruturais**: unidade/filial, centro de custo como entidade, calendário/feriados, módulos por plano.

### P1 — Documentos / Qualidade

19. **Modelos de documento + geração + assinatura** (termo de prorrogação, alteração contratual, aviso/recibo de férias, advertência, TRCT).
20. **Seeds + testes** do roteiro (script de seed da Mariana; testes de vigência, saldo de férias, folha proporcional, 13º, HE, status).

### P2 — Integrações

21. **eSocial** — modelo preparado para mapear S-2200, S-2205, S-2206, S-2230, S-1200, S-1210, S-2299, S-1299 (payload, recibo, status) sem travar o MVP.
22. FGTS Digital, contabilidade, operadoras de benefícios, banco/remessa de pagamento, assinatura digital.

---

## 7. Riscos e observações

- **Dependência crítica:** vários meses do roteiro (3, 4, 7, 16) ficam bloqueados sem o **motor de vigência/histórico funcional**. Recomenda-se priorizá-lo antes de telas isoladas, como o próprio PDF alerta.
- **Cálculo de folha hardcoded** (`InssCalculator`, `IrrfCalculator`, `FgtsCalculator`) com valores de 2024/2025 quebra rapidamente; o roteiro exige parametrização por competência.
- **Pagamentos (DP) x Folha (CTB) são silos separados:** `dp/payment` distribui PDFs da contabilidade e não se conecta ao `PayrollRun`. O roteiro pressupõe folha calculada internamente.
- **Privacidade LGPD** de documentos médicos/disciplinares é requisito recorrente (Meses 6, 9, 17) e hoje inexistente (storage com permissão global).
- **Auditoria com motivo** é P0 no PDF (TC-011) e está apenas como metadados created/updated; a tabela `audit_log` existe no schema mas não tem código.

---

## 8. Próximo passo recomendado

Conforme a seção 13 do roteiro:

1. Criar **script de seed** do tenant Oliveira & Santos + estrutura + colaboradora Mariana (já há base em `scripts/dev/seed-tenant-empresa-a.sql`).
2. Implementar primeiro o **motor de vigência/histórico funcional** e a **parametrização tributária por competência** (fundação que destrava o resto).
3. Criar **testes unitários** das regras puras (vigência, saldo de férias, folha proporcional, 13º, HE, status funcional).
4. Opcional: criar **tela de roteiro de aceite** em homologação marcando cada etapa como Passou/Falhou/Não implementado, espelhando este documento.

> Plano de execução por sprints detalhado em `docs/analise/plano-execucao-sprints.md`.
