# Mapa de navegação do Gesint (Client)

O sistema tem um rail à esquerda para escolher o domínio ativo:

- DP (Departamento Pessoal)
- RH (Recursos Humanos)
- CTB (Contabilidade / Folha)
- CFG (Configurações) — muda o menu para telas de configuração

Importante: o domínio ativo vem do rail, não da URL.

## DP — Departamento Pessoal

### Organização

- Departamentos → `/organization/departments`
- Cargos → `/organization/job-positions`

### Ponto

- Ponto (registros) → `/attendance`
- Solicitações de ajuste de ponto → dentro de Ponto

### Férias / afastamento / desligamento (lado DP)

- Férias → `/leave`
- Solicitações do RH (férias) → dentro de Férias
- Afastamento → `/leave/absence`
- Desligamento → `/offboarding`

### Colaboradores (compartilhado com RH)

- Admissão → `/collaborator/admission`
- Pessoas → `/collaborator/people`

### Pagamentos

- Pagamentos → `/payments`

## RH — Recursos Humanos

- Painel (dashboard) → `/dashboard`

### Colaboradores (compartilhado com DP)

- Admissão → `/collaborator/admission`
- Pessoas → `/collaborator/people`

### Recrutamento

- Vagas → `/job-vacancy` (lista, candidaturas no accordion, processo/kanban)
- Candidatos → `/candidate`
- Candidaturas → `/job-vacancy-application`

### Outros

- Férias (visão RH) → rota de férias do módulo Pessoas
- Entrevista de desligamento → `/exit-interview`
- PDI → `/development-plan`
- Desempenho → `/performance`

### Insights

- Relatórios → `/report`

## CTB — Contabilidade

### Folha

- Folha de pagamento → `/payroll`
- Eventos de folha → `/payroll/events`
- Holerites → `/payroll/payslips`

### Benefícios

- Planos → `/benefit`
- Vínculos → `/benefit/enrollments`

### Fiscal

- Fiscal → `/tax`

## CFG — Configurações

Acesse pelo ícone CFG no rail. Exemplos:

- Perfis → `/settings/profiles`
- Usuários → `/settings/users`
- Preferências → `/settings/preferences`
- Escalas → `/settings/work-schedules`
- Certificados digitais → `/settings/digital-certificates`
- Tipos de documento → `/settings/document-types`
- Colunas do Kanban (processo de admissão) → `/settings/admission-process-kanban`
- Checklist de devoluções → `/settings/exit-interview-return-checklist`

### PDI (cadastros)

- Competências → `/settings/pdi/competencies`
- Níveis de proficiência → `/settings/pdi/proficiency-levels`
- Trilhas → `/settings/pdi/tracks`
- Modelos de ação → `/settings/pdi/action-templates`
- Tipos de evidência → `/settings/pdi/evidence-types`
- Origens de PDI → `/settings/pdi/origins`

### Conta

- Configurações da conta → `/account`

## Dicas de resposta

- Se perguntarem "onde fica X", indique domínio (DP/RH/CTB/CFG), caminho de menu e a rota quando útil.
- Se não souber, diga que a base ainda está sendo enriquecida e sugira a busca global do header.
- Não invente telas que não estejam neste mapa.
