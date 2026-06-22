# Plano de Execução por Sprints — Ciclo de vida do colaborador (Gommo)

> Documento de planejamento. Não houve alteração de código.
> Base: `docs/analise/roteiro-ciclo-colaborador-gap.md` + `Roteiro_Gommo_Ciclo_Colaborador.pdf`.
> Objetivo: transformar o backlog priorizado em um plano executável por sprints, respeitando dependências técnicas e os padrões do projeto (`BaseController`/`BaseService`, Flyway, RBAC por módulo, multi-tenant por schema, frontend `tabbedCrudRoute`).

## Premissas do plano

- Sprint = 2 semanas. Estimativa total: **Sprint 0 + 15 sprints (~8 meses)** para 1 time full-stack pequeno. Ajustar conforme capacity real.
- Toda tabela nova segue o protocolo multi-tenant: migration Flyway no `gommo-backend` + inclusão em `TenantSchemaTableCatalog.HR_DATA_TABLES` + espelho no `seed-tenant-empresa-a.sql`.
- Regra de ouro do PDF: **tudo que muda no tempo tem vigência**; **folha fechada é imutável**; **mudança crítica gera trilha de auditoria com motivo**.
- "Pronto" = backend (entidade + migration + service + RBAC) + frontend (rota + lista + form) + teste da regra pura + critério de aceite do roteiro validado.

## Visão geral das fases

| Fase | Sprints | Foco | Destrava no roteiro |
|---|---|---|---|
| 0. Preparação | S0 | Seeds, ambiente de aceite | Fase 0 do roteiro |
| A. Fundação e governança | S1–S4 | Auditoria, vigência/histórico funcional, parametrização tributária | Meses 3,4,7,16; TC-005, TC-011 |
| B. Folha e tempo | S5–S9 | Proporcional, benefícios na folha, ponto, 13º | Meses 1,2,4,5,6,8,11,12; TC-003,004,006,008 |
| C. Ciclo de vida | S10–S12 | Afastamentos, férias, rescisão | Meses 6,9,10,13,14,15,18; TC-007,009,010 |
| D. Insumos e integrações | S13–S15 | Prontuário/ocorrências, relatórios/cadastros, documentos/eSocial | Meses 1,17; TC-001,012,013,014 |

---

## Sprint 0 — Preparação e baseline de aceite

**Objetivo:** ter o cenário do roteiro reproduzível antes de implementar regras.

- Seed do tenant Oliveira & Santos + unidade/depto/cargo/CC + eventos de folha + colaboradora Mariana (estender `scripts/dev/seed-tenant-empresa-a.sql`).
- Tela/checklist de roteiro de aceite em homologação (Passou/Falhou/Não implementado) espelhando o doc de gap.
- Configurar pipeline de testes (unitário + integração) para regras puras.

**Aceite:** rodar a história do roteiro do zero em homologação e marcar o baseline atual.

---

## Fase A — Fundação e governança

### Sprint 1 — Trilha de auditoria + governança de fechamento

**Objetivo:** tornar a tabela `audit_log` operacional e exigir motivo em ações críticas. Base de governança para todo o resto.

- Backend: entidade/repository/service para `audit_log` (já existe no schema, sem código); listener JPA genérico (entity, ação, valor anterior/novo, usuário, motivo); endpoint de consulta paginada e filtrável.
- Backend: justificativa obrigatória em `POST /payroll-runs/{id}/reopen` e em retificações; persistir `justificativa_reabertura`.
- Frontend: tela de auditoria (consulta por entidade/período/usuário); modal de motivo na reabertura de folha.
- Migrations: ajustes em `audit_log` se necessário; campo motivo em fluxos de reabertura.

**Aceite (roteiro):** TC-011; Mês 2 (reabertura controlada); Mês 18 (retificação exige justificativa).

### Sprint 2 — Motor de vigência + histórico funcional (salário e cargo)

**Objetivo:** alterações de cargo/salário com vigência, sem sobrescrever o passado. Maior alavanca do roteiro.

- Backend: entidade `historico_funcional` (tipo de evento, valor anterior/novo, `vigenciaInicio`/`vigenciaFim`, motivo, documento); serviço de aplicação de vigência; consulta "valor vigente em D".
- Backend: ao processar folha, resolver salário/cargo pela vigência da competência.
- Frontend: aba "Histórico funcional" no colaborador; ação "Alterar cargo/salário" com motivo + vigência + documento.
- Migrations: `salario_historico`, `cargo_historico` (ou tabela unificada de movimentação).

**Aceite (roteiro):** Mês 7 (promoção: folhas antigas mantêm R$ 4.800, julho usa R$ 5.600); TC-005. Dependência: Sprint 1 (auditoria).

### Sprint 3 — Histórico de lotação/jornada + movimentação interna

**Objetivo:** mudança de departamento/centro de custo/gestor/jornada com vigência.

- Backend: `lotacao_historico` e `jornada_historico`; `departmentId`/`costCenter`/`gestor` no contexto vigente do contrato.
- Backend: relatórios por período respeitam lotação vigente (DP até mar, RH a partir de abr).
- Frontend: ação "Movimentar" (depto/CC/gestor) com vigência; histórico de lotação no colaborador.
- Migrations: tabelas de histórico de lotação/jornada; ligação contrato–departamento.

**Aceite (roteiro):** Mês 16; também sustenta Mês 4 (efetivação como evento). Dependência: Sprint 2.

### Sprint 4 — Parametrização tributária por competência

**Objetivo:** remover INSS/IRRF/FGTS hardcoded; tabelas por vigência alimentam o cálculo.

- Backend: tabelas de faixas INSS/IRRF + alíquota FGTS por competência (parâmetro global por vigência); refatorar `InssCalculator`/`IrrfCalculator`/`FgtsCalculator` para ler por competência; conectar `TaxObligation` ao motor onde aplicável.
- Backend: cada rubrica explicável (base, alíquota, quantidade, valor, origem).
- Frontend: cadastro de parâmetros tributários por competência.
- Migrations: tabelas de parâmetros tributários versionados.

**Aceite (roteiro):** premissa de tabelas parametrizadas por competência; sustenta Meses 2, 11, 12 e TC-003/TC-008. Dependência: Sprint 1.

---

## Fase B — Folha completa e tempo

### Sprint 5 — Folha proporcional de admissão + dados bancários

**Objetivo:** primeira folha proporcional e cadastro bancário completo.

- Backend: `BaseSalaryStrategy` considera dias trabalhados no mês de admissão (usa `startDate` do contrato).
- Backend: entidade `dado_bancario` do colaborador (banco, agência, conta, tipo, PIX).
- Frontend: seção bancária no colaborador/admissão; exibir proporcional no holerite.
- Migrations: tabela `dado_bancario`.

**Aceite (roteiro):** Mês 1 (folha proporcional de janeiro; dados bancários). Dependência: Sprint 4.

### Sprint 6 — Dependentes + benefícios na folha

**Objetivo:** dependentes por finalidade e benefícios refletindo na folha.

- Backend: entidade `dependente` (finalidades: IRRF, salário-família, benefício, emergência) + `beneficio_dependente`; catálogo de tipos de benefício (VT/VA/VR/saúde).
- Backend: provider de benefícios no processamento da folha (desconto/custo por competência; rubricas VT/VA).
- Frontend: dependentes no colaborador; vínculo de dependente ao benefício; relatório de custo (empresa x colaborador).
- Migrations: `dependente`, `beneficio_dependente`; rubricas seed VT/VA.

**Aceite (roteiro):** Meses 2 (VT/VA na folha), 4 (plano de saúde com desconto), 8 (dependente); TC-006. Dependência: Sprint 4.

### Sprint 7 — Motor de ponto: jornada estruturada + apuração

**Objetivo:** transformar ponto de cadastro em controle de jornada.

- Backend: entidade de jornada/escala (dias, horários, intervalo, carga); múltiplas batidas; motor de apuração diária/mensal (normais, faltas, atrasos) com tolerância configurável; espelho de ponto.
- Frontend: espelho de ponto mensal; configuração de jornada; tolerância.
- Migrations: `jornada_trabalho`, `apuracao_ponto`, ajustes em marcação.

**Aceite (roteiro):** Mês 2 (apurar jornada sem faltas); base do TC-004. Dependência: Sprint 3 (jornada vigente).

### Sprint 8 — Banco de horas + horas extras + aprovação

**Objetivo:** HE por tipo de dia, banco de horas e workflow de exceções.

- Backend: HE 50% (útil) e 100% (domingo/feriado) usando calendário; banco de horas com saldo/extrato; workflow de aprovação de exceções (trilha de auditoria); folha recebe só eventos aprovados; DSR e faltas integrados.
- Frontend: aprovação de exceções; extrato de banco de horas; saldo antes/depois.
- Migrations: `banco_horas`, `ocorrencia_ponto`.

**Aceite (roteiro):** Meses 5, 6 (abono no ponto); TC-004. Dependência: Sprints 7, 1 (auditoria), 4 (calendário/feriados — ver S14, usar feriados nacionais já existentes no interim).

### Sprint 9 — 13º salário (1ª e 2ª parcela)

**Objetivo:** processar 13º proporcional.

- Backend: `tipo_folha` (mensal/13º/férias/rescisão); cálculo de avos por admissão/meses; 1ª e 2ª parcela (2ª desconta a 1ª); bases INSS/IRRF/FGTS específicas do 13º; recibo separado.
- Frontend: abertura de folha de 13º; marcação de pagamento; relatório separando mensal x 13º.
- Migrations: `tipo_folha`; rubricas de 13º.

**Aceite (roteiro):** Meses 11, 12; TC-008. Dependência: Sprints 2 (salário vigente), 4 (bases).

---

## Fase C — Ciclo de vida

### Sprint 10 — Afastamentos com regras + status funcional

**Objetivo:** distinguir tipos de afastamento, retorno e privacidade.

- Backend: catálogo `tipo_afastamento`; regra atestado curto x afastamento previdenciário (primeiros 15 dias empresa / restante INSS); campo CID protegido; `retorno_afastamento`; integração com ponto (abono) e folha; status funcional derivado de eventos (Ativa/Afastada/Férias/Desligada); alertas de retorno.
- Frontend: registro com tipo/CID/documento; controle de acesso a doc sensível (LGPD); painel de status funcional.
- Migrations: `tipo_afastamento`, `retorno_afastamento`, campos CID/sensibilidade.

**Aceite (roteiro):** Meses 6, 9, 10; TC-007. Dependência: Sprints 7/8 (ponto), 1 (auditoria).

### Sprint 11 — Férias completas

**Objetivo:** ciclo de férias ponta a ponta.

- Backend: período aquisitivo/concessivo persistido; saldo persistido com extrato; etapa do gestor no workflow (gestor + RH); recibo de férias com 1/3 (médias art. 142) como evento na folha; integração férias -> ponto (bloqueio) e férias -> folha (não duplicar).
- Frontend: workflow gestor+RH; calendário individual; geração de aviso/recibo; extrato de saldo.
- Migrations: `periodo_aquisitivo`, `saldo_ferias`, `recibo_ferias`.

**Aceite (roteiro):** Meses 13, 14, 15; TC-009. Dependência: Sprints 7 (ponto), 4 (bases), 9 (tipo de folha).

### Sprint 12 — Rescisão completa

**Objetivo:** desligamento com verbas, documentos e efeitos colaterais.

- Backend: `processo_rescisao` + `verba_rescisoria` (saldo salário, férias vencidas/proporcionais, 13º proporcional, descontos); aviso prévio (trabalhado/indenizado); multa FGTS; geração de TRCT/demonstrativo; status Desligada no colaborador; bloqueio de `AppUser`; exclusão de folhas futuras; reabertura com justificativa.
- Frontend: assistente de rescisão; demonstrativo de verbas; checklist demissional.
- Migrations: `processo_rescisao`, `verba_rescisoria`, `checklist_demissional`.

**Aceite (roteiro):** Mês 18; TC-010. Dependência: Sprints 2, 9, 11, 1.

---

## Fase D — Insumos e integrações

### Sprint 13 — Prontuário digital + ocorrências/disciplinar

**Objetivo:** dossiê do colaborador e governança disciplinar.

- Backend: prontuário (anexos ligados ao colaborador) com permissão diferenciada para docs sensíveis; entidade `ocorrencia` (advertência/feedback) com visibilidade restrita e auditoria; ciência/aceite.
- Frontend: prontuário consolidado; registro de ocorrência com confidencialidade.
- Migrations: `anexo_prontuario`, `ocorrencia`.

**Aceite (roteiro):** Meses 1, 17; TC-012. Dependência: Sprint 1.

### Sprint 14 — Relatórios gerenciais + cadastros estruturais

**Objetivo:** indicadores e estrutura organizacional faltante.

- Backend: relatórios headcount por período/status, absenteísmo, turnover, custos, folha por centro de custo; aceitar filtros (competência, período, unidade, depto, CC, status).
- Backend: entidade `unidade/estabelecimento`; `centro_custo` como entidade; cadastro de calendário/feriados (nacional/estadual/municipal) por unidade.
- Frontend: módulo Relatórios (substituir placeholder `/report`); telas de unidade, CC e calendário; tela de empresa no menu.
- Migrations: `unidade`, `centro_custo`, `calendario`/`feriado`.

**Aceite (roteiro):** TC-013, TC-001 (módulos/estrutura); Fase 0 (calendário/CC). Dependência: Sprints 3, 8 (calendário melhora HE/DSR).

### Sprint 15 — Documentos/templates, assinatura e preparação eSocial

**Objetivo:** geração documental e modelo pronto para integrações.

- Backend: `modelo_documento` + `documento_gerado` (merge fields) para termo de prorrogação, alteração contratual, aviso/recibo de férias, advertência, TRCT; assinatura/aceite digital.
- Backend: modelo de mapeamento eSocial (entidades de payload/recibo/status para S-2200, S-2205, S-2206, S-2230, S-1200, S-1210, S-2299, S-1299) sem transmitir — apenas preparado.
- Frontend: editor/uso de modelos; histórico de documentos gerados.
- Migrations: `modelo_documento`, `documento_gerado`, `assinatura_documento`, tabelas de evento eSocial.

**Aceite (roteiro):** Meses 3, 7, 14, 17, 18 (documentos); TC-014 (eSocial mapeável). Dependência: Sprints 2, 11, 12.

---

## Mapa Sprint x Mês do roteiro x Caso de teste

| Sprint | Meses do roteiro | TCs | Entrega central |
|---|---|---|---|
| S0 | Fase 0 | — | Seed + ambiente de aceite |
| S1 | 2, 18 | TC-011, TC-003 | Auditoria + justificativa |
| S2 | 7 | TC-005 | Vigência salário/cargo |
| S3 | 16, 4 | TC-005 | Histórico lotação/jornada |
| S4 | 2, 11, 12 | TC-003, TC-008 | Parametrização tributária |
| S5 | 1 | TC-002 | Proporcional + bancário |
| S6 | 2, 4, 8 | TC-006 | Dependentes + benefícios na folha |
| S7 | 2 | TC-004 | Motor de ponto |
| S8 | 5, 6 | TC-004 | Banco de horas + HE |
| S9 | 11, 12 | TC-008 | 13º salário |
| S10 | 6, 9, 10 | TC-007 | Afastamentos + status |
| S11 | 13, 14, 15 | TC-009 | Férias completas |
| S12 | 18 | TC-010 | Rescisão completa |
| S13 | 1, 17 | TC-012 | Prontuário + ocorrências |
| S14 | Fase 0 | TC-013, TC-001 | Relatórios + estrutura |
| S15 | 3, 7, 14, 17, 18 | TC-014 | Documentos + eSocial |

## Dependências críticas (ordem obrigatória)

- S1 (auditoria) antes de qualquer ação crítica (S2, S8, S10, S12).
- S2 -> S3 -> (S9, S11, S12): vigência é pré-requisito de 13º, férias e rescisão.
- S4 (parametrização) antes de S5, S6, S9 (cálculos confiáveis).
- S7 -> S8 -> (S10, S11): motor de ponto antes de afastamentos e férias integradas.

## Riscos e mitigação

- **Escopo do motor de ponto (S7/S8)** é o maior risco de estouro; considerar MVP de apuração mensal antes de banco de horas completo.
- **Cálculos legais (folha/13º/rescisão/férias)** exigem validação com DP/contador; manter rubricas explicáveis e parametrizadas.
- **Multi-tenant:** cada tabela nova precisa entrar no catálogo de clonagem e no seed, ou quebra em tenants existentes.
- **Encoding (Windows/CP1252):** ao gerar `.md`/`.ts`/`.sql`/`.java`, garantir gravação em UTF-8 válido.
