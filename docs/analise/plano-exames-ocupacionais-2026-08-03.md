# Plano de Execucao - Modulo de Controle de Exames Ocupacionais - 2026-08-03

> Base deste plano: `Parecer Tecnico e Especificacao de Referencia - Modulo de
> Controle de Exames Ocupacionais` (elaborado para o sistema Lysian Pessoas) +
> validacao normativa atualizada (agosto/2026) + leitura da arquitetura atual
> do Gesint (`gesint-backend` e `gesint-frontend`; `gesint-admin-*` fora de escopo).
>
> Este documento segue o mesmo formato de
> `docs/analise/plano-afastamentos-2026-06-24.md`: primeiro o contexto e as
> regras de negocio, depois os prompts prontos para colar no Cursor, na ordem
> em que devem ser executados.

## 1. Objetivo

Implementar, em `gesint-backend` e `gesint-frontend`, o modulo de Controle de
Exames Ocupacionais como **motor de conformidade** (NR-7, eSocial, LGPD) e nao
como simples agenda com anexo de PDF. O parecer tecnico deixa claro o
diferencial: o valor do modulo esta em calcular obrigacoes, nao em apenas
registra-las.

Tres decisoes estruturais nao sao negociaveis e devem entrar ja na Fase 1:

1. **Matriz de exames** (funcao -> exame exigido -> periodicidade) como espinha
   dorsal. Vencimento sempre calculado, nunca digitado.
2. **ASO separado dos exames complementares.** O ASO e o atestado; cada exame
   complementar (audiometria, espirometria, hemograma etc.) e um registro
   individual com codigo proprio.
3. **Esquema de dados aderente ao leiaute do eSocial S-2220 desde o dia 1**,
   mesmo que a transmissao automatica fique para uma fase posterior.

## 2. Correcoes feitas na fundamentacao normativa do parecer

O parecer original tem pequenas imprecisoes que foram checadas contra fontes
oficiais (gov.br/esocial, gov.br/trabalho-e-emprego) em agosto/2026. Usar
apenas a versao corrigida abaixo ao escrever mensagens de sistema, comentarios
de codigo ou textos de tela — nao usar os valores errados do parecer original:

| Ponto | Parecer original | Correcao |
|---|---|---|
| Excecao de periodicidade para condicoes hiperbaricas | "Anexo IV" da NR-7 | E o **Anexo 6 da NR-15** (Norma Regulamentadora 15), nao a NR-7. |
| Base legal do prazo de dispensa do demissional (135/90 dias) | Cita "Portaria MTE 1.218/2024" | **Nao ha registro oficial dessa portaria** em in.gov.br ou gov.br. A regra de 135/90 dias existe e e valida, mas esta consolidada diretamente no **item 7.4.3.5 da NR-7 vigente**. Nao referenciar a portaria inexistente em codigo, exception ou UI; referenciar "NR-7, item 7.4.3.5". A lista de agentes criticos que impedem a dispensa (benzeno, chumbo, radiacoes ionizantes, biologicos classe 3-4) deve ser tratada como **parametro configuravel**, nao lista fixa em codigo, e revisada com um responsavel tecnico em SST antes de virar bloqueio automatico. |
| PPP (Perfil Profissiografico Previdenciario) | Tratado como "futura integracao" | O PPP eletronico **ja e obrigatorio e exclusivo desde 01/jan/2023**, e e gerado pelo INSS/Meu INSS a partir dos eventos S-2210/S-2220/S-2240 — nao e o Gesint quem emite o PPP. **Nao ha entrega de PPP neste plano**; o que importa e manter S-2220/S-2240 consistentes, porque e disso que o PPP depende. |
| Versao do leiaute eSocial | Nao especificada | Leiaute vigente em 2026 e o **S-1.3** (MOS consolidado ate 03/2025). O layout evolui; guardar a versao do leiaute usada em cada evento gerado (campo `layoutVersion`), nao assumir versao fixa no codigo. |
| Codigos da Tabela 27 (procedimentos) | Lista fechada no texto (01, 03, 06, 14, 20...) | Os codigos citados existem na Tabela 27, mas **nao foram todos conferidos um a um** (ex.: "20 = ECG" nao confirmado). Nao codificar a tabela como enum fixo no Java — carregar como **tabela de referencia seedada por migration**, validada contra o MOS antes de ir para producao. |
| Retencao de 20/40 anos | Citado como regra fechada | 20 anos (regra geral) e 40 anos (substancias cancerigenas) estao corretos. Regimes ">40 anos" para radiacao ionizante/asbesto **nao foram confirmados** como categoria separada — provavelmente ja caem na regra de 40 anos por serem cancerigenos. Modelar retencao como **campo configuravel por tipo de agente**, com 20/40 como default, nao like valor unico hardcoded. |
| Sancao LGPD (2% do faturamento, ate R$ 50 milhoes) | Citado | Confirmado, segue vigente. Nota adicional: a ANPD passou a autarquia (Lei 15.352/2026) e intensificou fiscalizacao de dados de saude — reforca a prioridade do RBAC/trilha de auditoria na Fase 1. |

O restante do parecer (taxonomia dos 5 tipos de exame, cadeia normativa
CLT/NR-1/NR-7/eSocial/LGPD, maquina de estados, motor de regras de
periodicidade, indicadores) foi conferido e esta correto — usar como
especificacao funcional de referencia.

## 3. Onde o modulo entra na arquitetura do Gesint

Levantamento feito em `gesint-backend/src/main/java/br/com/gesint/modules` e
`gesint-frontend/src/modules`, e em `.agents/rules/gesint.mdc`:

- O modulo mais proximo estruturalmente e `rh/person/leave` (`LeaveRequest`):
  colaborador, CID, medico/CRM, datas, maquina de estados, `AuditEntity`. E o
  padrao de referencia para tudo abaixo.
- Upload/anexo (ASO, laudos) **nao deve ser reimplementado**: reaproveitar
  `br.com.gesint.modules.storage` (`StorageObject` + `StorageObjectLink`, com
  `sha256Hex` ja cobrindo o requisito de hash de integridade do parecer) e o
  componente `EntityAttachments` no frontend.
- CRUD segue `BaseController` / `BaseService` / `IBaseRepository`. RBAC via
  `@PreAuthorize` no service, autoridades `{modulo}:{read|write|delete}`.
- Migrations: proximo numero livre em `gesint-backend/src/main/resources/db/migration`
  e **V80** (confirmar o mais alto na hora de implementar, pois novas
  migrations podem ter sido criadas). Padrao: `V{n}__descricao_snake_case.sql`.
- Enums Postgres nativos: seguir o padrao de `V43__leave_absence_rules_and_attendance_occurrence.sql`
  (`CREATE TYPE x_enum AS ENUM (...)`). Como o projeto mantem um espelho dos
  enums em `gesint_types` (domains, ver `V78`/`V79`) para o `search_path`
  multi-tenant, **toda migration que criar um enum novo deve terminar com**
  `CREATE DOMAIN gesint_types.<nome_do_enum> AS public.<nome_do_enum>;` (dentro
  de um bloco idempotente `IF NOT EXISTS`), mesmo que nenhuma migration depois
  de V79 tenha feito isso ainda — e a extensao natural do padrao existente.
- Caminho de modulo (frontend e backend devem espelhar o menu lateral, regra
  do `gesint.mdc`): o modulo fica em **RH > Pessoas**, ao lado de Ferias/Afastamento.
  Pacote backend: `br.com.gesint.modules.dp.occupationalexam`. Pasta
  frontend: `src/modules/dp/occupational-exam`. Novo item de menu
  "Exames Ocupacionais" em `organization.routes.ts (rail DP)`, permissao raiz `occupationalexam:read`.
- Multi-tenant: toda tabela nova precisa (1) migration no `gesint-backend`, (2)
  entrada em `TenantSchemaTableCatalog.HR_DATA_TABLES` no admin-backend, (3)
  espelhamento em `scripts/dev/seed-tenant-empresa-a.sql`. Isso esta fora do
  escopo de "ignorar gesint-admin" porque e cadastro de catalogo, nao logica de
  produto — os prompts abaixo cobram isso explicitamente.

### 3.1 Entidades novas (Fase 1)

Pacote `br.com.gesint.modules.dp.occupationalexam`, uma subpasta por
entidade (`clinic/`, `physician/`, `examrequirement/`, `exam/`,
`complementaryexam/`), cada uma com `controller/dto/entity/exception/mapper/repository/service`,
igual ao `leave`.

| Entidade | Papel | Campos essenciais |
|---|---|---|
| `MedicalClinic` | Clinica credenciada | razaoSocial, cnpj, endereco, telefone, email, examesRealizados (texto/lista), vigenciaCredenciamento |
| `OccupationalPhysician` | Medico examinador/coordenador | fullName, crm, crmState (UF), role (`EXAMINER`/`PCMSO_COORDINATOR`), clinicId (nullable), phone, email — CRM+UF **obrigatorios**, sao campo rejeitavel no eSocial |
| `ExamRequirement` (matriz de exames) | `JobPosition` -> exame exigido -> periodicidade | jobPositionId, examTypeCode (0-4, ver 3.2), complementaryExamCodes (refs a Tabela 27), periodicityMonths (nullable p/ tipos disparados por evento), riskBasis (texto — referencia manual ao PGR/GHE, ver nota abaixo), versionNumber, validFrom, validUntil (nullable). **Versionada**: editar nunca sobrescreve; fecha `validUntil` da versao anterior e cria nova linha. |
| `OccupationalExam` (agregado principal, ASO) | Ciclo de vida completo de uma obrigacao de exame | collaboratorId, jobPositionId (snapshot), examTypeCode, lifecycleStatus (ver 3.3), clinicId, examinerPhysicianId, coordinatorPhysicianId, scheduledDate, clinicalExamDate, asoIssueDate (**diferente** de clinicalExamDate — o eSocial usa a primeira), dueDate (calculado pela matriz, nunca digitado), result (`FIT`/`UNFIT`, binario), cid (so se `UNFIT`), clinicalObservations (texto restrito), sourceTrigger (`MATRIX_SCHEDULE`/`ADMISSION`/`LEAVE_RETURN`/`POSITION_CHANGE`/`TERMINATION`/`MANUAL`), relatedLeaveRequestId (nullable), examRequirementVersionId (auditoria de qual versao da matriz gerou a obrigacao), dismissalWaiverApplied + dismissalWaiverReason (para a regra de dispensa do demissional), retentionUntil (calculado) |
| `ComplementaryExam` | Exame complementar (1:N de `OccupationalExam`) | occupationalExamId, procedureCode (FK para tabela de referencia da Tabela 27), performedDate, result (`NORMAL`/`ALTERED`/`NOT_PERFORMED`) |
| `EsocialTable27Procedure` | Tabela de referencia (seed via migration, nao enum) | code, description, active |

Nota sobre "Funcao/GHE": o Gesint ainda nao tem modulo de PGR/GRO (inventario
de riscos). `ExamRequirement.riskBasis` e um campo de texto para documentar
manualmente a base da exigencia ate que exista um modulo de risco formal —
isso e uma simplificacao deliberada do MVP, nao um erro; registrar como
pendencia futura, sem bloquear a Fase 1.

### 3.2 Codigos de tipo de exame (alinhados ao S-2220)

```text
0 = ADMISSIONAL
1 = PERIODICO
2 = RETORNO_AO_TRABALHO
3 = MUDANCA_DE_RISCO_OCUPACIONAL
4 = DEMISSIONAL
```

### 3.3 Maquina de estados (`lifecycleStatus`)

```text
PREVISTO -> CONVOCADO -> REALIZADO -> REGISTRADO -> TRANSMITIDO -> ARQUIVADO
                                                              (excecao) -> VENCIDO_INADIMPLENTE
```

Regras: `PREVISTO` so nasce automatico (pela matriz ou por gatilho de evento),
nunca manual como regra geral. `REGISTRADO` exige validacao de completude (sem
CRM, sem codigo de exame complementar ou sem resultado, o registro nao fecha).
`ARQUIVADO` bloqueia exclusao fisica. `TRANSMITIDO` tem prazo proprio (dia 15
do mes seguinte a `clinicalExamDate`) e alerta proprio.

## 4. RBAC — desvio de padrao que precisa de justificativa explicita

O padrao atual do Gesint e autoridade unica por modulo (`modulo:read|write|delete`).
O parecer exige, por LGPD (minimizacao + segregacao de acesso), que dado
clinico (CID, resultado de complementares, observacoes) fique invisivel para o
RH operacional e visivel so para o perfil de saude ocupacional/SESMT. Isso
**nao cabe** no padrao de autoridade unica.

Decisao proposta (documentar no PR como excecao justificada, conforme regra
"nao criar padrao novo sem justificativa explicita" do `gesint.mdc`):
adicionar uma quarta autoridade **`occupationalexam:clinical`**, alem de
`read/write/delete`. `OccupationalExamResponseDto` tera duas visoes montadas
pelo mapper: campos operacionais (status, aptidao, vencimento, colaborador,
tipo) sempre visiveis a quem tem `occupationalexam:read`; campos clinicos
(`cid`, `clinicalObservations`, resultado de cada `ComplementaryExam`) so
preenchidos se o usuario tiver `occupationalexam:clinical`, caso contrario
retornam `null`/omitidos. Isso e checado no service, nao so escondido no
frontend.

## 5. Motor de regras (Fase 2) — resumo operacional

- **Admissional**: bloqueia a conclusao da admissao no DP se nao houver
  `OccupationalExam` tipo 0 com `result = FIT` registrado.
- **Periodico**: periodicidade sempre lida de `ExamRequirement` (nunca valor
  global fixo). Anual para expostos a risco (ou menor a criterio medico),
  bienal para os demais; excecao de condicoes hiperbaricas conforme Anexo 6
  da NR-15 (ver correcao da secao 2).
  Antecedencia de alerta: 30/60/90 dias, parametrizavel, considerando
  colaboradores afastados/de ferias (reprogramar convocacao).
- **Retorno ao trabalho**: gatilho automatico quando `LeaveRequest` registra
  afastamento >= 30 dias por doenca/acidente; alerta ao RH antes da data
  prevista de retorno.
- **Mudanca de risco**: gatilho no fluxo de mudanca de cargo/GHE; compara
  `ExamRequirement` da funcao de origem com a de destino.
- **Demissional**: em ate 10 dias do termino do contrato; dispensavel se o
  exame ocupacional mais recente foi ha menos de 135 dias (graus de risco 1-2)
  ou 90 dias (graus 3-4), sem exposicao a agente critico (lista configuravel,
  ver secao 2). Base legal a citar: **NR-7, item 7.4.3.5** (nao a portaria
  inexistente).
- **Retencao documental**: minimo 20 anos apos desligamento; 40 anos para
  substancias cancerigenas (campo configuravel, default 20/40). Imutabilidade
  apos `REGISTRADO`/`ARQUIVADO`; sem exclusao fisica; pedido de eliminacao
  LGPD (art. 16, I) nao se aplica a esses registros.

## 6. Roadmap (mantido do parecer, com escopo tecnico por fase)

| Fase | Escopo | Criterio de pronto |
|---|---|---|
| Fase 1 — Fundacao | `MedicalClinic`, `OccupationalPhysician`, `ExamRequirement` (matriz versionada), `OccupationalExam` + `ComplementaryExam`, upload de ASO via storage existente, RBAC com `occupationalexam:clinical`, telas de cadastro/listagem | Nenhum vencimento digitado a mao; nenhum ASO sem medico identificado; dado clinico invisivel ao perfil RH sem a autoridade `clinical` |
| Fase 2 — Motor de conformidade | Gatilhos automaticos (admissao, retorno de afastamento, mudanca de funcao, desligamento com regra de dispensa), maquina de estados completa, alertas 30/60/90, painel de indicadores | Sistema decide quando um exame e exigivel e documenta a base da decisao |
| Fase 3 — Transmissao e integracao | `EsocialTable27Procedure` seedada, `EsocialHealthEvent` (payload S-2220, protocolo/recibo, status), **certificado digital por tenant**, consistencia com S-2240 (se/quando existir modulo de PGR/GRO), politica de retencao automatizada | Aderencia de transmissao >= 99% no prazo; auditoria ponta a ponta de qualquer ASO em menos de 1 minuto |

Este plano cobre prompts detalhados para as Fases 1 e 2 (motor de dados e de
regras — onde esta o valor juridico do modulo) e um prompt de preparacao para
a Fase 3 (schema pronto para eSocial, sem exigir a integracao de transmissao
real agora).

### 6.1 Certificado digital — por cliente (tenant), nao pelo Gesint

O certificado usado para assinar/enviar eventos eSocial e **do empregador
(cliente do Gesint)**, nunca um certificado unico da plataforma.

Exemplo: Cliente A contrata o Gesint. Para haver envios ao eSocial, o Cliente A
precisa ja ter (ou obter) suas proprias credenciais no eSocial e um certificado
digital ICP-Brasil valido (tipicamente e-CNPJ A1). O Gesint apenas armazena e
usa esse certificado **no schema/tenant daquele cliente**, sem misturar com
outros tenants.

#### O que sistemas de mercado costumam oferecer

| Campo / recurso | Mercado tipico | Essencial no Gesint? |
|---|---|---|
| Upload A1 (.pfx / .p12) + senha | Sim | **Sim** |
| Alias / apelido do certificado | Sim | **Sim** |
| Validade (inicio/fim) lida do certificado | Sim | **Sim** (extraida no upload) |
| Titular / CNPJ-CPF do certificado | Sim | **Sim** (extraido; editavel se preciso) |
| Ambiente homologacao vs producao | Frequente | **Sim** |
| Marcar certificado padrao | Frequente | **Sim** (um default por tenant) |
| Finalidade (eSocial, NF-e, geral) | Frequente | **Sim** (inicio: `ESOCIAL`) |
| Serial / thumbprint | Frequente | **Sim** (auditoria / unicidade) |
| Aviso de vencimento (30/15/7 dias) | Frequente | Depois (notificacao) |
| Teste de assinatura / conexao | Frequente | Fase 3 transmissao |
| A3 (token/cartao/HSM) | Em desktop/on-prem | **Nao no SaaS inicial** (exige hardware/HSM) |
| Cadeia ICP completa manual | Raro/avancado | Nao |
| Multiplos certificados ativos | Sim | Sim (com 1 default) |

#### Requisitos de seguranca do cadastro

- PKCS#12 e senha **nunca** retornam na API de leitura.
- Conteudo e senha ficam cifrados em repouso (chave de aplicacao por ambiente).
- Isolamento por tenant (schema); certificado do Cliente A nao e visivel/usavel
  pelo Cliente B.
- Tela em **Configuracoes > Certificados digitais** (`CFG`), nao no modulo RH
  de exames — porque o mesmo certificado serve a transmissao eSocial futura
  alem do S-2220.

#### Escopo ja implementavel sem transmissao

Cadastro/listagem/edicao/exclusao do certificado A1 por tenant, com metadados
extraidos do PKCS#12. A transmissao real (assinatura + webservice) continua
pendente da Fase 3 completa e usa o certificado marcado como padrao do tenant.

## 7. Prompts para o Cursor

Executar na ordem. Cada prompt e autocontido (pode ser colado sozinho no
Cursor); os prompts posteriores assumem que os anteriores ja rodaram. Depois
de cada prompt, revisar o diff antes de seguir para o proximo.

### Prompt 0 — Leitura e confirmacao do plano (sem gerar codigo)

```text
Antes de qualquer alteracao, leia:
- docs/analise/plano-exames-ocupacionais-2026-08-03.md (este arquivo completo)
- .agents/rules/gesint.mdc
- O modulo gesint-backend/src/main/java/br/com/gesint/modules/rh/person/leave
  (entity, controller, service, repository, mapper, exception, domain) como
  padrao de referencia estrutural
- gesint-backend/src/main/java/br/com/gesint/modules/storage (StorageObject,
  StorageObjectLink) e o componente frontend EntityAttachments
- gesint-backend/src/main/resources/db/migration/V78__gesint_types_schema_for_tenant_search_path.sql,
  V79__move_enums_to_gesint_types.sql e V43__leave_absence_rules_and_attendance_occurrence.sql
- Confirme qual e o proximo numero de migration livre em
  gesint-backend/src/main/resources/db/migration (o plano assume V80, mas
  pode ter mudado)
- Confirme se ja existe qualquer coisa relacionada a "exame ocupacional",
  "ASO", "PCMSO" ou "eSocial" no codigo (schema.sql de dump, migrations,
  entidades) antes de criar do zero

Depois de ler, responda com um resumo curto (nao gere codigo ainda):
1. proximo numero de migration a usar;
2. se ha algo pre-existente sobre exames ocupacionais que deva ser reaproveitado
   em vez de recriado;
3. confirmar se o pacote br.com.gesint.modules.dp.occupationalexam e o
   caminho src/modules/dp/occupational-exam estao livres.
```

### Prompt 1 — Migration Fase 1 (schema completo do modulo)

```text
Crie a migration Flyway V{N}__occupational_exam_module.sql em
gesint-backend/src/main/resources/db/migration (N = proximo numero livre,
confirmado no Prompt 0), seguindo exatamente o estilo de
V43__leave_absence_rules_and_attendance_occurrence.sql (CREATE TYPE ... AS ENUM,
depois CREATE TABLE, indices no final, tudo idempotente onde fizer sentido).

Enums a criar:
- occupational_exam_type_enum: ('ADMISSIONAL','PERIODICO','RETORNO_AO_TRABALHO',
  'MUDANCA_DE_RISCO_OCUPACIONAL','DEMISSIONAL') -- mapeados aos codigos 0-4 do
  S-2220 na camada Java, nao no banco
- occupational_exam_lifecycle_status_enum: ('PREVISTO','CONVOCADO','REALIZADO',
  'REGISTRADO','TRANSMITIDO','ARQUIVADO','VENCIDO_INADIMPLENTE')
- occupational_exam_result_enum: ('FIT','UNFIT')
- occupational_exam_source_trigger_enum: ('MATRIX_SCHEDULE','ADMISSION',
  'LEAVE_RETURN','POSITION_CHANGE','TERMINATION','MANUAL')
- occupational_physician_role_enum: ('EXAMINER','PCMSO_COORDINATOR')
- complementary_exam_result_enum: ('NORMAL','ALTERED','NOT_PERFORMED')

Ao final da migration, para cada enum criado acima, adicione (em bloco
idempotente) o espelho:
CREATE DOMAIN gesint_types.<nome_do_enum> AS public.<nome_do_enum>;
protegido por IF NOT EXISTS (verifique pg_type/pg_namespace, igual ao bloco de
V78__gesint_types_schema_for_tenant_search_path.sql).

Tabelas a criar (todas com id UUID gerado, code INT sequencial unico, status
status_enum default 'ACTIVE', created_by/created_at/updated_by/updated_at
timestamptz, igual ao padrao de BaseEntity/AuditEntity — nao reinvente essas
colunas, replique o que ja existe em outras tabelas do modulo leave):

1. medical_clinic: corporate_name VARCHAR(200) NOT NULL, cnpj VARCHAR(20) NOT
   NULL, address VARCHAR(255), phone VARCHAR(30), email VARCHAR(150),
   exams_offered TEXT, accreditation_valid_until DATE

2. occupational_physician: full_name VARCHAR(180) NOT NULL, crm VARCHAR(20)
   NOT NULL, crm_state CHAR(2) NOT NULL, role occupational_physician_role_enum
   NOT NULL, clinic_id UUID REFERENCES medical_clinic(id), phone VARCHAR(30),
   email VARCHAR(150)

3. esocial_table27_procedure: code VARCHAR(10) NOT NULL UNIQUE, description
   VARCHAR(200) NOT NULL, active BOOLEAN NOT NULL DEFAULT true -- seed com pelo
   menos os codigos 01 (audiometria tonal), 03 (acuidade visual), 06
   (hemograma), 14 (espirometria) - NAO seedar codigo "20 = ECG" sem confirmar
   contra o MOS oficial do eSocial S-1.3; se nao for possivel confirmar agora,
   deixar comentario TODO no INSERT e seedar so os 4 codigos confirmados

4. exam_requirement (matriz de exames, versionada): job_position_id UUID NOT
   NULL REFERENCES job_position(id), exam_type occupational_exam_type_enum NOT
   NULL, complementary_procedure_codes TEXT[] (array de codigos da Tabela 27,
   nullable), periodicity_months INT (nullable — tipos disparados por evento
   nao tem periodicidade fixa), risk_basis TEXT, version_number INT NOT NULL
   DEFAULT 1, valid_from DATE NOT NULL, valid_until DATE (nullable = versao
   vigente). Indice em (job_position_id, exam_type, valid_from) para busca da
   versao vigente.

5. occupational_exam (agregado principal / ASO): collaborator_id UUID NOT
   NULL, job_position_id UUID NOT NULL, exam_type occupational_exam_type_enum
   NOT NULL, lifecycle_status occupational_exam_lifecycle_status_enum NOT
   NULL DEFAULT 'PREVISTO', clinic_id UUID REFERENCES medical_clinic(id),
   examiner_physician_id UUID REFERENCES occupational_physician(id),
   coordinator_physician_id UUID REFERENCES occupational_physician(id),
   scheduled_date DATE, clinical_exam_date DATE, aso_issue_date DATE, due_date
   DATE, result occupational_exam_result_enum, cid VARCHAR(20), clinical_observations
   TEXT, source_trigger occupational_exam_source_trigger_enum NOT NULL DEFAULT
   'MANUAL', related_leave_request_id UUID REFERENCES leave_request(id),
   exam_requirement_version_id UUID REFERENCES exam_requirement(id),
   dismissal_waiver_applied BOOLEAN NOT NULL DEFAULT false,
   dismissal_waiver_reason TEXT, retention_until DATE. Indices: (collaborator_id,
   exam_type, due_date), (lifecycle_status), (collaborator_id, cid) WHERE cid
   IS NOT NULL.

6. complementary_exam: occupational_exam_id UUID NOT NULL REFERENCES
   occupational_exam(id) ON DELETE CASCADE, procedure_code VARCHAR(10) NOT
   NULL REFERENCES esocial_table27_procedure(code), performed_date DATE,
   result complementary_exam_result_enum NOT NULL DEFAULT 'NOT_PERFORMED'.

Nao crie a tabela de evento eSocial (esocial_health_event) ainda — isso e Fase
3, prompt separado.

Depois de criar a migration:
1. Adicione as 6 tabelas novas em TenantSchemaTableCatalog.HR_DATA_TABLES no
   gesint-admin-backend (mesma lista onde estao leave_request, department etc.).
2. Espelhe as tabelas em scripts/dev/seed-tenant-empresa-a.sql (tenant_tables),
   seguindo o mesmo formato das tabelas ja existentes.
3. Rode (ou descreva como rodar, se nao houver banco disponivel no ambiente)
   a migration contra o banco de dev e confirme que nao ha erro de sintaxe.
```

### Prompt 2 — Entidades JPA, DTOs, mapper, exception, repository (Fase 1)

```text
Crie as entidades e a camada de dados para o modulo de Exames Ocupacionais em
gesint-backend/src/main/java/br/com/gesint/modules/dp/occupationalexam,
com uma subpasta por entidade (clinic/, physician/, examrequirement/, exam/,
complementaryexam/), cada uma com controller/dto/entity/exception/mapper/repository/service,
exatamente como o modulo rh/person/leave.

Padrao obrigatorio para cada entidade JPA (copie o estilo de LeaveRequest.java):
- extends AuditEntity (nunca reimplemente id/code/status/audit)
- @Getter @Setter @SuperBuilder @NoArgsConstructor @AllArgsConstructor
- NUNCA @Data
- enums Postgres nomeados via @Enumerated(EnumType.STRING) @JdbcTypeCode(SqlTypes.NAMED_ENUM)
  @Column(columnDefinition = "<nome_do_enum>")
- campos de array (complementary_procedure_codes) mapeados como
  List<String> com o tipo de coluna adequado para TEXT[] (siga o padrao ja
  usado em Department.responsibleCollaboratorIds para JSONB, ou o equivalente
  correto para array nativo Postgres — verifique se o projeto ja tem um
  exemplo de coluna array antes de decidir a anotacao)

Entidades: MedicalClinic, OccupationalPhysician (+ enum OccupationalPhysicianRoleEnum),
EsocialTable27Procedure, ExamRequirement (+ enum OccupationalExamTypeEnum com
os 5 valores e um metodo ou campo auxiliar para o codigo numerico 0-4 do
S-2220), OccupationalExam (+ enums OccupationalExamLifecycleStatusEnum,
OccupationalExamResultEnum, OccupationalExamSourceTriggerEnum),
ComplementaryExam (+ enum ComplementaryExamResultEnum).

DTOs: classes Lombok (nunca record), um par Request/Response por entidade,
seguindo o nome {Entity}RequestDto / {Entity}ResponseDto. Bean Validation nos
campos obrigatorios (ex.: @NotNull em collaboratorId, examType; @NotBlank em
crm, crmState).

IMPORTANTE - RBAC de dado clinico (ver secao 4 do plano): crie DUAS variantes
de leitura para OccupationalExam:
- OccupationalExamResponseDto: campos operacionais (id, code, status,
  collaboratorId, jobPositionId, examType, lifecycleStatus, clinicId,
  examinerPhysicianId, coordinatorPhysicianId, scheduledDate, clinicalExamDate,
  asoIssueDate, dueDate, result, sourceTrigger) - SEM cid, SEM
  clinicalObservations
- OccupationalExamClinicalResponseDto (ou um campo aninhado "clinicalData"
  dentro do response, nullable): cid, clinicalObservations, e a lista de
  ComplementaryExam com resultado

O mapper monta o campo/DTO clinico somente quando explicitamente solicitado
pelo service (que decide isso checando a autoridade occupationalexam:clinical
do usuario autenticado) - implemente esse ponto de decisao no service, nao no
controller, e deixe um comentario no codigo explicando o motivo (LGPD -
minimizacao de acesso a dado de saude sensivel).

Repository: interfaces estendendo o padrao do projeto (IBaseRepository +
Spring Data JPA), com metodos de busca especificos onde fizer sentido:
- ExamRequirementRepository: findVigente(jobPositionId, examType, referenceDate)
  para buscar a versao vigente da matriz
- OccupationalExamRepository: findByCollaboratorIdOrderByDueDateDesc,
  findByLifecycleStatusAndDueDateBefore (para os alertas/vencidos)

Exception: catalogo {Modulo}Exceptions + {Modulo}Exception por entidade
(ou um catalogo unico OccupationalExamExceptions para todo o modulo, se for
mais compativel com o tamanho do modulo - decida olhando outros modulos de
tamanho parecido), integrado ao GlobalExceptionHandler.

Nao implemente ainda o motor de regras (calculo de vencimento, gatilhos,
maquina de estados) - isso e o proximo prompt. Este prompt e so a camada de
dados e CRUD basico.
```

### Prompt 3 — Service, Controller, RBAC (Fase 1)

```text
Implemente os services e controllers do modulo de Exames Ocupacionais.

Controllers: um por entidade, extends BaseController<RequestDto, ResponseDto>,
rota /api/v1/occupational-exams, /api/v1/medical-clinics,
/api/v1/occupational-physicians, /api/v1/exam-requirements. Nao redeclare
endpoints CRUD padrao - so adicione endpoints extras quando necessario, por
exemplo:
- GET /api/v1/occupational-exams/due (proximos vencimentos, com parametro de
  janela em dias: 30/60/90)
- GET /api/v1/occupational-exams/overdue (vencidos/inadimplentes)
- POST /api/v1/occupational-exams/{id}/schedule (transicao PREVISTO -> CONVOCADO)
- POST /api/v1/occupational-exams/{id}/register-result (transicao REALIZADO ->
  REGISTRADO, valida completude: exige medico examinador, ao menos os exames
  complementares previstos na matriz com resultado preenchido, e CID se result
  = UNFIT)

Services: extends BaseService<Entity, RequestDto, ResponseDto> implements
I{Entity}Service, RBAC via @PreAuthorize("hasAuthority('occupationalexam:read')")
/ 'occupationalexam:write' / 'occupationalexam:delete' em cada metodo publico,
igual ao padrao do LeaveRequestService. No metodo de leitura de
OccupationalExam, aplique a logica de RBAC clinico descrita no Prompt 2:
so preencher CID/observacoes/resultado de complementares se
hasAuthority('occupationalexam:clinical'); caso contrario, esses campos vem
nulos/omitidos na resposta, mesmo que o usuario tenha 'occupationalexam:read'.

Regras de negocio a implementar no service (nao no controller):
1. Ao criar OccupationalExam sem due_date explicito: buscar a versao vigente
   de ExamRequirement (job_position_id + exam_type + data de referencia),
   calcular due_date a partir de periodicity_months (ou deixar null se o tipo
   e disparado por evento, ex. demissional). Nunca aceitar due_date digitado
   manualmente se houver matriz vigente para aquela funcao/tipo - se o usuario
   tentar sobrescrever, rejeitar com exception clara.
2. Transicao para REGISTRADO: validar completude (medico com CRM+UF
   preenchidos, todos os exames complementares previstos na matriz com
   resultado, CID obrigatorio se result = UNFIT). Bloquear a transicao e
   retornar mensagem de validacao especifica se algo faltar.
3. Apos REGISTRADO/ARQUIVADO: bloquear qualquer PUT/PATCH que altere
   clinical_exam_date, aso_issue_date, result, cid, ou os complementary_exam
   vinculados - lancar excecao de imutabilidade (documento clinico e prova
   juridica, nao pode ser reescrito).
4. Calculo de retention_until: na transicao para ARQUIVADO (ou no
   desligamento do colaborador, se essa informacao estiver disponivel),
   calcular data de desligamento + 20 anos (default) - permitir override via
   parametro/config para 40 anos quando o exame envolver agente cancerigeno
   (campo booleano ou lista de agentes no ExamRequirement, a definir; nao
   hardcode so 20 e so 40 sem ponto de configuracao).

Adicione as novas autoridades em uma migration de permissoes (siga o padrao
de V6__roadmap_permissions.sql ou equivalente mais recente): occupationalexam:read,
occupationalexam:write, occupationalexam:delete, occupationalexam:clinical -
mais medicalclinic:read/write/delete, occupationalphysician:read/write/delete,
examrequirement:read/write/delete (ou reaproveitar o mesmo prefixo
occupationalexam se o projeto preferir um unico modulo de permissao para as
entidades auxiliares - verifique como o projeto tratou entidades auxiliares
de outros modulos parecidos antes de decidir). Role ADMIN recebe tudo
(incluindo clinical); crie tambem um exemplo de role "Saude Ocupacional /
SESMT" com occupationalexam:clinical mas sem occupationalexam:delete, e
garanta que o perfil padrao de RH NAO receba occupationalexam:clinical por
default.
```

### Prompt 4 — Anexos (ASO e laudos) via storage existente (Fase 1)

```text
Integre o upload de ASO e laudos de exames complementares ao mecanismo de
storage ja existente (br.com.gesint.modules.storage: StorageObject +
StorageObjectLink), sem reimplementar upload/hash.

Backend: ao vincular um documento a um OccupationalExam, crie
StorageObjectLink com entityType = "OCCUPATIONAL_EXAM", entityId = id do
OccupationalExam, linkRole = "ASO" para o atestado principal, e considere um
linkRole = "COMPLEMENTARY_EXAM_REPORT" com um discriminador (por exemplo
metadata ou displayName) referenciando o ComplementaryExam especifico, caso o
projeto suporte vincular a um sub-item - se nao suportar, documente essa
limitacao e vincule no nivel do OccupationalExam mesmo.

Frontend: reutilize o componente EntityAttachments (mesma API usada em outros
modulos - verifique um uso existente, por exemplo em collaborators ou
admissionprocess, e replique a integracao) na tela de detalhe/edicao do
OccupationalExam, com entityType="OCCUPATIONAL_EXAM" e documentTypeItems
representando pelo menos "ASO" e "Laudo de exame complementar".

Nao adicione campo de hash manual na entidade OccupationalExam - o hash de
integridade (sha256Hex) ja existe em StorageObject e cobre o requisito do
parecer tecnico.
```

### Prompt 5 — Gatilhos automaticos e alertas (Fase 2)

```text
Implemente o motor de gatilhos automaticos do modulo de Exames Ocupacionais,
seguindo as regras da secao 5 do plano
(docs/analise/plano-exames-ocupacionais-2026-08-03.md). Antes de codificar,
localize os pontos de extensao/eventos existentes para admissao,
afastamento, mudanca de cargo e desligamento (procure por publishers de
evento Spring, listeners, ou pontos de servico equivalentes ja usados por
outros modulos para reagir a essas mudancas - por exemplo como o modulo de
ponto/attendance reage a LeaveRequest, visto em
V43__leave_absence_rules_and_attendance_occurrence.sql) e reaproveite o
mesmo mecanismo, em vez de criar um novo padrao de integracao entre modulos.

Gatilhos a implementar:
1. Admissao concluida -> criar OccupationalExam PREVISTO, exam_type =
   ADMISSIONAL, source_trigger = ADMISSION. Bloquear a conclusao do fluxo de
   admissao do DP se nao existir OccupationalExam tipo ADMISSIONAL com
   result = FIT (adicione esse ponto de validacao no fluxo de admissao
   existente - identifique o service responsavel antes de alterar).
2. LeaveRequest com duracao >= 30 dias e tipo de afastamento por doenca ou
   acidente, ao ser validado/finalizado -> criar OccupationalExam PREVISTO,
   exam_type = RETORNO_AO_TRABALHO, source_trigger = LEAVE_RETURN,
   related_leave_request_id preenchido. Devido a data prevista de retorno,
   gerar alerta ao RH com a antecedencia configurada.
3. Mudanca de funcao/cargo do colaborador -> comparar ExamRequirement vigente
   da funcao de origem com a da funcao de destino; se houver exame exigido na
   funcao de destino que nao exista (ou esteja vencido) para o colaborador,
   criar OccupationalExam PREVISTO, exam_type = MUDANCA_DE_RISCO_OCUPACIONAL,
   source_trigger = POSITION_CHANGE, ANTES da data efetiva da mudanca (nao
   depois).
4. Desligamento -> avaliar se o exame demissional e exigivel: dispensavel se
   o exame ocupacional mais recente do colaborador foi realizado ha menos de
   135 dias (graus de risco 1-2 da funcao) ou 90 dias (graus 3-4), sem
   exposicao a agente critico. Se exigivel, criar OccupationalExam PREVISTO,
   exam_type = DEMISSIONAL, source_trigger = TERMINATION, com prazo de 10 dias
   corridos do termino do contrato. Se dispensado, marcar
   dismissal_waiver_applied = true e preencher dismissal_waiver_reason com a
   base do calculo (data do exame anterior, dias corridos, grau de risco) -
   essa e a evidencia citada no parecer para fiscalizacao.

Alertas: implemente um job/consulta (nao precisa ser scheduler assincrono
nesta fase se o projeto nao tiver um padrao de job estabelecido - verifique
antes) que retorna OccupationalExam com due_date dentro de 30/60/90 dias e
ainda em PREVISTO ou CONVOCADO, e outra consulta para VENCIDO_INADIMPLENTE
(due_date passado sem lifecycle_status = REGISTRADO/TRANSMITIDO/ARQUIVADO) -
essa transicao para VENCIDO_INADIMPLENTE pode ser feita em uma consulta/job
diario simples.

Escreva testes unitarios para as regras puras de calculo (elegibilidade de
dispensa do demissional, calculo de due_date pela matriz, deteccao de exame
exigido na mudanca de funcao), no mesmo estilo de LeaveAbsenceRulesTest.
```

### Prompt 6 — Frontend: telas de cadastro e listagem (Fase 1/2)

```text
Crie as telas do modulo de Exames Ocupacionais em
gesint-frontend/src/modules/dp/occupational-exam, seguindo a estrutura
e as convencoes do modulo rh/person/leave (LeaveRequestRhListClient,
LeaveVacationRequestFormClient, LeaveVacationWorkspacePage) e as regras
obrigatorias de frontend do .agents/rules/gesint.mdc: services extends
BaseService, fetch nativo (api.client.ts/api.server.ts), rotas em
.routes.ts tipadas via tabbedCrudRoute, listas com QueryTablePanel/DataTable,
formularios com CrudFormShell + FormSection, campos de selecao usando
InputSelect/InputSelectAutocomplete (nunca <select> nativo).

Estrutura por subentidade (components/config/dto/exceptions/lib/services),
cobrindo: MedicalClinic, OccupationalPhysician, ExamRequirement (matriz de
exames) e OccupationalExam (tela principal, com aba/secao para os exames
complementares vinculados e para os anexos via EntityAttachments, conforme
Prompt 4).

Na tela de OccupationalExam:
- Se o usuario nao tiver a permissao occupationalexam:clinical (verifique via
  useHasPermission/useSessionPermissions, igual ao padrao de
  shared/auth/permissions.ts), oculte os campos CID, observacoes clinicas e
  resultado de cada exame complementar - a API ja retorna esses campos como
  null para esse perfil (Prompt 3), entao o form deve tratar ausencia de
  dado, nao so esconder visualmente um campo que a API ainda enviaria.
- due_date deve aparecer como somente leitura (calculado), nunca campo
  editavel livre.
- Adicione indicador visual de status (PREVISTO/CONVOCADO/REALIZADO/
  REGISTRADO/TRANSMITIDO/ARQUIVADO/VENCIDO_INADIMPLENTE) com cor por
  severidade (ex.: VENCIDO_INADIMPLENTE em destaque de alerta).

Registre o novo modulo em
gesint-frontend/src/modules/rh/person/config/organization.routes.ts (rail DP), agrupado com os
demais itens de DP, permission inicial "occupationalexam:read",
icone do lucide-react coerente com saude ocupacional (ex.: Stethoscope ou
HeartPulse - verifique quais icones ja estao disponiveis no projeto antes de
adicionar import novo).
```

### Prompt 7 — Painel de indicadores (Fase 2)

```text
Implemente os indicadores gerenciais descritos na secao 9 do parecer tecnico
(docs anexo original) como endpoints de consulta (nao precisa de tela nova
separada se o projeto ja tiver um padrao de dashboard/insights em
rh/dashboard ou rh/insights - verifique e reaproveite):

1. Taxa de conformidade: % de colaboradores ativos com todos os exames da
   matriz vigente dentro da validade.
2. Exames vencidos / a vencer: contagem e lista nominal por janela (vencidos,
   30, 60, 90 dias) - reaproveite as consultas do Prompt 5.
3. Cobertura da matriz: % de funcoes ativas (JobPosition status ACTIVE) com
   ExamRequirement vigente definido.
4. Pendencias de desligamento: desligamentos com demissional exigivel (
   dismissal_waiver_applied = false) nao realizado dentro do prazo de 10 dias.

Deixe a "aderencia de transmissao" (dependente do S-2220 real) e o "tempo de
ciclo" como pendencia documentada para a Fase 3, ja que dependem do evento
eSocial que ainda nao existe.
```

### Prompt 8 — Preparacao de schema para eSocial S-2220 (Fase 3, sem transmissao)

```text
Crie a estrutura de dados para o evento eSocial S-2220, SEM implementar a
transmissao real (sem chamada a webservice do eSocial nesta fase) - o
objetivo e deixar o dado "nascendo transmissivel", conforme a decisao
arquitetural do parecer tecnico.

Migration nova (proximo numero livre): tabela esocial_health_event com
occupational_exam_id UUID NOT NULL REFERENCES occupational_exam(id), event_type
VARCHAR(10) NOT NULL DEFAULT 'S-2220', layout_version VARCHAR(10) NOT NULL
DEFAULT 'S-1.3', payload_json JSONB, protocol_number VARCHAR(60),
receipt_number VARCHAR(60), transmission_status
esocial_transmission_status_enum NOT NULL DEFAULT 'PENDING' (enum:
'PENDING','GENERATED','TRANSMITTED','REJECTED'), transmission_deadline DATE,
errors TEXT. Nao esqueca o espelho em gesint_types (mesmo padrao do Prompt 1) e
o cadastro em TenantSchemaTableCatalog + seed-tenant-empresa-a.sql.

Regra de calculo: transmission_deadline = dia 15 do mes seguinte a
occupational_exam.clinical_exam_date.

Service: ao transicionar OccupationalExam para REGISTRADO, gerar
automaticamente um EsocialHealthEvent em status PENDING com o
transmission_deadline calculado (ainda sem payload real nem envio). Deixe um
metodo/service claramente nomeado (ex.: buildS2220Payload) que hoje so monta
a estrutura de dados em memoria a partir do OccupationalExam +
ComplementaryExam vinculados, sem persistir nem enviar - isso documenta o
mapeamento de campos e sera o ponto de extensao quando a transmissao real for
implementada.

Nao implemente S-2210 nem S-2240 neste momento - o parecer os cita como
contexto de consistencia (cruzamento), mas nao fazem parte deste modulo.
```

### Prompt 9 — Validacao final

```text
Rode a validacao completa do que foi implementado nos prompts anteriores:
1. Backend: mvn (ou o wrapper configurado no projeto) compile, test, e o
   perfil de lint/formatacao usado no projeto (Spotless/palantirJavaFormat).
2. Frontend: npm run lint, tsc --noEmit, e build.
3. Confirme que toda migration nova tem o espelho em gesint_types e a entrada
   correspondente em TenantSchemaTableCatalog + seed-tenant-empresa-a.sql.
4. Rode os testes unitarios criados nos Prompts 5 e 8.
5. Revise manualmente: nenhum vencimento de exame e campo digitavel livre,
   nenhum ASO e registravel sem medico com CRM+UF, dado clinico (CID,
   observacoes, resultado de complementares) nao aparece na resposta da API
   para um usuario sem occupationalexam:clinical, e nenhum registro em
   REGISTRADO/ARQUIVADO pode ser alterado via PUT/PATCH.
6. Atualize a secao "Status da implementacao" ao final deste plano (crie a
   secao se nao existir, no mesmo formato usado em
   docs/analise/plano-afastamentos-2026-06-24.md), marcando o que foi
   concluido e o que ficou pendente para a Fase 3 completa (transmissao real
   do S-2220).
```

## 8. Criterio de aceite geral do modulo

- Colaborador tem seus exames ocupacionais (por funcao) derivados
  automaticamente da matriz, sem digitacao manual de vencimento.
- ASO e exames complementares sao entidades separadas, cada complementar com
  codigo da Tabela 27.
- Nenhum ASO fecha (`REGISTRADO`) sem medico com CRM+UF.
- Dado clinico (CID, observacoes, resultado de complementar) so e visivel a
  quem tem a autoridade `occupationalexam:clinical`.
- Documentos (ASO, laudos) sao armazenados via o mecanismo de storage
  existente, com hash de integridade, e ficam imutaveis apos `REGISTRADO`.
- O esquema de dados ja e compativel com o leiaute do eSocial S-2220 (tipos
  0-4, resultado binario, Tabela 27, CRM/UF obrigatorios, separacao entre data
  do exame clinico e data de emissao do ASO), mesmo sem transmissao automatica
  ativa.
- Nenhuma referencia no codigo ou em textos de tela cita a "Portaria MTE
  1.218/2024" (nao confirmada) - a base legal citada e sempre "NR-7, item
  7.4.3.5".

## Status da implementacao

Branch: `feature/exames-ocupacionais`

### Prompt 0 — Leitura
- [x] Proximo migration: **V80** (V79 era o ultimo).
- [x] Nada pre-existente de exame ocupacional / ASO / PCMSO / eSocial no codigo.
- [x] Pacotes `dp.occupationalexam` e `dp/occupational-exam` livres.

### Fase 1
- [x] Migration `V80__occupational_exam_module.sql` (enums, 6 tabelas, seed Tabela 27
  com 01/03/06/14, espelho `gesint_types`, sync tenant).
- [x] `TenantSchemaTableCatalog.HR_DATA_TABLES` + `seed-tenant-empresa-a.sql`.
- [x] Entidades/DTOs/mappers/repos/exceptions/services/controllers do modulo.
- [x] RBAC `occupationalexam:read|write|delete|clinical` em `V81__occupational_exam_permissions.sql`
  (ADMIN tudo; HR sem clinical/delete; role SESMT com clinical sem delete).
- [x] Regras basicas: due_date pela matriz, imutabilidade REGISTRADO/ARQUIVADO,
  register-result com CRM+UF/CID/complementares, endpoints due/overdue/schedule.
- [x] Anexos via `EntityAttachments` (`entityType=OCCUPATIONAL_EXAM`, tipos ASO /
  COMPLEMENTARY_EXAM_REPORT).
- [x] Frontend: listagem/formulario de OccupationalExam + grupo de rotas em
  `organization.routes.ts (rail DP)` (icone Stethoscope).
- [x] Telas auxiliares FE: Clinica medica, Medico ocupacional e Matriz de exames
  (list/form + `routeGroup` sob Exames ocupacionais).

### Fase 2
- [x] Gatilhos automaticos via `OccupationalExamTriggerService` (sem Spring Events;
  hooks nos services existentes):
  - admissao: cria PREVISTO admissional; bloqueia COMPLETED sem ASO FIT;
  - afastamento >= 30 dias (doenca/acidente) validado -> retorno ao trabalho;
  - mudanca de `jobPositionId` no contrato -> mudanca de risco;
  - desligamento -> demissional ou dispensa (NR-7, 7.4.3.5) com evidencia;
  - `POST /occupational-exams/mark-overdue` para VENCIDO_INADIMPLENTE.
- [x] Testes unitarios `OccupationalExamComplianceRulesTest`.
- [x] Indicadores: `GET /occupational-exams/indicators` + painel na listagem FE
  (conformidade, cobertura da matriz, vencidos/30/60/90, demissionais
  pendentes). Aderencia de transmissao e tempo de ciclo ficam para Fase 3.

### Fase 3
- [x] Migration `V82__esocial_health_event.sql` + catalogo/seed.
- [x] `EsocialS2220Service.ensurePendingEvent` ao REGISTRADO;
  `buildS2220Payload` em memoria (sem envio).
- [x] Teste `EsocialS2220ServiceTest`.
- [x] Cadastro de certificado digital A1 por tenant (`V85`, CFG >
  Certificados digitais): PKCS#12 + senha cifrados; metadados extraidos;
  default/ambiente/finalidade. Sem transmissao ainda.
- [ ] Transmissao real do webservice eSocial (assinatura + envio + recibo).

### Prompt 9 — Validacao final
- [x] Backend `mvnw -DskipTests compile`: passou.
- [x] Testes `OccupationalExamComplianceRulesTest` + `EsocialS2220ServiceTest`: passaram.
- [~] Spotless (`spotless:check`): falha preexistente em dezenas de arquivos fora do
  modulo; `spotless:apply` aplicado ao pacote `occupationalexam`.
- [x] Frontend `tsc --noEmit`: passou.
- [x] Frontend `npm run build`: passou (apos criar `page.tsx` das rotas).
- [~] Frontend `npm run lint`: falha preexistente no repo (shared/workspace/input);
  sem erros novos no modulo occupational-exam.
- [x] Catalogo tenant: `TenantSchemaTableCatalog.HR_DATA_TABLES` +
  `seed-tenant-empresa-a.sql` com as 7 tabelas do modulo.
- [x] Enums novos em `gesint_types` (V80/V82).
- [x] Revisao manual das regras-chave:
  - due_date somente leitura no FE (`InputInfo`); override com matriz vigente bloqueado no BE;
  - REGISTRADO exige medico com CRM+UF;
  - `clinicalData` so com `occupationalexam:clinical`;
  - imutabilidade pos REGISTRADO/ARQUIVADO;
  - base legal NR-7 item 7.4.3.5 (sem Portaria MTE 1.218/2024 no codigo/UI).

### Banco
- [x] V80/V81/V82 aplicadas no Postgres local (enums em `gesint_types`).
- [x] V83: `complementary_procedure_codes` TEXT[] -> JSONB (padrao List via JSON).
- [x] V84: `occupational_physician.crm_state` CHAR(2) -> VARCHAR(2).
- [x] Historico Flyway reparado apos ajustes de checksum da V80.

### Pendente (Fase 3 completa)
- Transmissao real S-2220 (usar certificado padrao do tenant) / aderencia /
  tempo de ciclo / alerta de vencimento do certificado.
