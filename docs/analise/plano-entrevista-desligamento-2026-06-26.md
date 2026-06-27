# Plano de Acao - Entrevista de Desligamento - 2026-06-26

> Documento de planejamento/continuidade. Implementacao na branch
> `feat/exit-interview-module`. Tela alvo: `/exit-interview`.

## Objetivo

Evoluir o modulo existente de Entrevista de Desligamento para permitir ao RH
registrar, acompanhar, concluir, cancelar e consultar entrevistas de
colaboradores CLT e prestadores PJ, respeitando os padroes atuais do Gommo e
sem misturar avaliacao de gestor nem revogacao de acessos de TI.

## Regras obrigatorias lidas

- `.agents/rules/gommo.mdc`
- `.agents/rules/gommo-frontend-ui.mdc`
- `.agents/rules/gommo-ui-system.mdc`

A regra especifica de folha/payroll nao se aplica porque esta tarefa nao altera
folha de pagamento.

## Arquitetura atual encontrada

### Backend

Ja existe um modulo minimo em:

- `br.com.gommo.modules.rh.person.exitinterview.entity.ExitInterview`
- `dto/ExitInterviewRequestDto.java`
- `dto/ExitInterviewResponseDto.java`
- `mapper/ExitInterviewMapper.java`
- `repository/ExitInterviewRepository.java`
- `service/ExitInterviewService.java`
- `controller/ExitInterviewController.java`

O controller ja expoe CRUD em `/api/v1/exit-interviews` via `BaseController`.
O service ja usa `BaseService` e RBAC com:

- `exitinterview:read`
- `exitinterview:write`
- `exitinterview:delete`

A tabela `exit_interview` ja existe e esta cadastrada no fluxo multi-tenant:

- migration original `V5__roadmap_domains_and_storage.sql`
- `TenantSchemaTableCatalog.HR_DATA_TABLES`
- `scripts/dev/seed-tenant-empresa-a.sql`

Portanto, a implementacao deve evoluir a tabela existente por migration, nao
criar um modulo paralelo.

### Frontend

Ja existe tela CRUD em:

- `gommo-frontend/src/modules/rh/person/exitinterview/components/ExitInterviewListClient.tsx`
- `gommo-frontend/src/modules/rh/person/exitinterview/components/ExitInterviewFormClient.tsx`
- `dto/exit-interview.dto.ts`
- `services/exit-interview.service.ts`
- `lib/exit-interview.mapper.ts`
- `config/exit-interview.table-columns.ts`

A rota ja esta registrada em RH/Pessoas com `tabbedCrudRoute` e `href:
"/exit-interview"`.

### Padroes semelhantes

- `dp/offboarding`: desligamento administrativo com anexos simples.
- `rh/person/leave`: formulario completo com stepper, anexos com upload diferido,
  acoes e validacoes.
- `EntityAttachments`: componente compartilhado para documentos/anexos.
- `AdmissionProcess`: uso de `@JdbcTypeCode(SqlTypes.JSON)` com colunas JSONB.

## Decisoes de modelagem

1. Manter o agregado principal como `exit_interview`.
2. Adicionar colunas estruturadas para indicadores futuros:
   - status da entrevista;
   - tipo de vinculo;
   - tipo de desligamento/encerramento;
   - motivo principal;
   - datas e snapshots organizacionais.
3. Usar JSONB para estruturas naturalmente variaveis:
   - motivos secundarios;
   - avaliacoes 1 a 5;
   - perguntas abertas;
   - checklist de devolucoes;
   - metadados de modelo dinamico.
4. Preservar snapshots editaveis de cargo, departamento, empresa, gestor,
   matricula e datas de contrato para manter historico mesmo que cadastros
   relacionados mudem depois.
5. Diferenciar CLT e PJ por `relationshipType` e listas de tipos de encerramento
   separadas no frontend, sem tratar PJ como empregado CLT.
6. Usar anexos pelo padrao existente de storage com `EntityAttachments`, sem
   criar tabela de documento propria.
7. Adicionar acoes explicitas para concluir e cancelar no backend, mantendo CRUD
   padrao no `BaseController`.

## Backend - plano de implementacao

### Migration

Criar `V46__expand_exit_interview_module.sql` para evoluir `exit_interview`:

- `interview_status` com default `DRAFT`;
- `relationship_type` (`CLT`, `PJ`);
- snapshots: matricula, cargo, departamento, empresa, gestor, datas de admissao
  ou contrato, data de desligamento/encerramento e tempo em dias;
- tipo de desligamento/encerramento;
- entrevistador;
- motivo principal, motivos secundarios e descricao detalhada;
- avaliacoes JSONB;
- respostas abertas JSONB;
- respostas de recontratacao;
- checklist de devolucoes JSONB;
- campos para modelo dinamico/versionamento;
- timestamps e motivo de conclusao/cancelamento quando aplicavel;
- indices para filtros e indicadores futuros.

Como a tabela ja existe no catalogo multi-tenant, nao e necessario adicionar
nova tabela ao admin/seed. Se futuramente forem criadas tabelas normalizadas
para modelos dinamicos, elas deverao entrar no catalogo tenant.

### Entidade e DTOs

Expandir `ExitInterview` e seus DTOs seguindo Lombok/classes:

- enums de status da entrevista;
- enum de tipo de vinculo;
- enums para desligamento CLT e encerramento PJ;
- enum de motivos;
- enum de respostas de recontratacao;
- enum de status de devolucao;
- DTOs internos para ratings, respostas e checklist.

### Service

- Enriquecer cadastro/atualizacao com dados do colaborador quando possivel.
- Validar obrigatorios minimos.
- Impedir conclusao sem dados minimos:
  - colaborador;
  - tipo de vinculo;
  - data da entrevista;
  - data de desligamento/encerramento;
  - tipo de desligamento/encerramento;
  - responsavel pela entrevista;
  - motivo principal ou descricao detalhada;
  - status compativel.
- Impedir edicao de entrevista concluida/cancelada, exceto se o sistema ja
  permitir reabrir em outra regra futura.
- Criar `complete(id)` e `cancel(id, reason)` com RBAC especifico.

### Controller

Manter CRUD herdado do `BaseController` e adicionar somente endpoints custom:

- `POST /api/v1/exit-interviews/{id}/complete`
- `POST /api/v1/exit-interviews/{id}/cancel`

### Permissoes

Manter permissoes atuais e adicionar, se necessario:

- `exitinterview:complete`
- `exitinterview:cancel`
- `exitinterview:attach`

O upload em si continuara usando o modulo compartilhado de storage.

## Frontend - plano de implementacao

### Listagem

Evoluir `ExitInterviewListClient` e colunas para mostrar:

- codigo;
- colaborador;
- vinculo;
- status da entrevista;
- data da entrevista;
- desligamento/encerramento;
- motivo principal;
- departamento/cargo quando informado.

### Formulario

Evoluir `ExitInterviewFormClient` com `CrudFormShell`, `FormSection`, stepper e
inputs compartilhados:

1. Dados basicos
2. Motivos
3. Avaliacao da empresa
4. Perguntas abertas
5. Recontratacao
6. Devolucoes
7. Documentos

As opcoes de tipo de encerramento devem mudar conforme `CLT` ou `PJ`, mantendo
nomenclatura adequada para cada vinculo.

### Anexos

Usar `EntityAttachments` com `entityType="exit_interview"` e tipos de documento:

- termo de desligamento;
- entrevista assinada;
- distrato/encerramento contratual PJ;
- comprovante de devolucao;
- outro documento.

## Fora do escopo

- Avaliacao do gestor.
- Revogacao de acessos de TI.
- Dashboard de indicadores.
- Calculos trabalhistas de verbas rescisorias.
- Regras inventadas nao suportadas por cadastro ou informacao fornecida.

## Criterios de aceite

- Branch dedicada criada.
- Plano documentado antes da implementacao.
- Tela `/exit-interview` permite listar, criar, editar enquanto em andamento,
  concluir, cancelar e anexar documentos.
- CLT e PJ possuem nomenclatura e opcoes separadas.
- Dados estruturados suportam indicadores futuros.
- Backend compila e validacoes minimas protegem conclusao incompleta.
- Frontend passa lint/typecheck quando possivel.
- Implementacao segue padroes existentes de CRUD, RBAC, DTOs, migrations,
  componentes e navegacao.

## Status

- [x] Branch dedicada criada: `feat/exit-interview-module`.
- [x] Regras obrigatorias lidas.
- [x] Arquitetura atual analisada.
- [x] Implementacoes semelhantes localizadas.
- [x] Migration implementada: `V46__expand_exit_interview_module.sql`.
- [x] Backend expandido com entidade, DTOs, enums, service, controller e acoes `complete`/`cancel`.
- [x] Frontend expandido com listagem, formulario por secoes, CLT/PJ, checklist e anexos.
- [x] Validacoes executadas: `mvnw.cmd test`, `npm exec -- tsc --noEmit`, `npm run lint` e `git diff --check`.
## Implementacao realizada

### Backend

- `ExitInterview` passou a armazenar status proprio da entrevista, tipo de
  vinculo, snapshots organizacionais, tipo de desligamento/encerramento,
  motivos, avaliacoes, respostas abertas, recontratacao, checklist de
  devolucoes e metadados para modelo dinamico.
- Criados enums e DTOs auxiliares para manter contrato tipado e evolutivo.
- Service passou a preencher snapshots quando possivel a partir de colaborador,
  contrato, cargo, departamento e empresa.
- Conclusao exige dados minimos e valida compatibilidade entre vinculo CLT/PJ e
  tipo de desligamento/encerramento.
- Entrevistas concluidas ou canceladas nao podem ser editadas pelo fluxo comum.

### Endpoints

- CRUD existente: `/api/v1/exit-interviews`.
- Novo: `POST /api/v1/exit-interviews/{id}/complete`.
- Novo: `POST /api/v1/exit-interviews/{id}/cancel`.

### Migration

- `V46__expand_exit_interview_module.sql` adiciona colunas estruturadas,
  JSONB para dados variaveis, indices para indicadores futuros e permissoes:
  - `exitinterview:complete`;
  - `exitinterview:cancel`;
  - `exitinterview:attach`.

### Frontend

- A tela `/exit-interview` reaproveita a rota existente em RH/Pessoas.
- Formulario organizado em: Dados, Motivos, Avaliacao, Perguntas,
  Recontratacao, Devolucoes e Documentos.
- Tipos de desligamento CLT e encerramento PJ ficam separados no formulario.
- Anexos usam `EntityAttachments` com `entityType="exit_interview"`.
- Listagem exibe vinculo, status, data, tipo de encerramento, motivo principal e
  setor quando informado.

### Preparado para evolucao futura

- `templateKey`, `templateVersion` e `templatePayload` deixam caminho para
  modelos dinamicos por empresa/vinculo.
- `ratings`, `openAnswers` e `returnChecklist` estao em JSONB para evoluir sem
  refatoracao pesada na primeira versao.
- Campos estruturados principais permitem indicadores por periodo, vinculo,
  setor, cargo, motivo, tempo de casa/contrato e recontratacao.