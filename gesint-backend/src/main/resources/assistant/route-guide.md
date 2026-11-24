# Mapa de navegação do Gesint (Client)

O sistema tem um rail à esquerda para escolher o domínio ativo:

- DP (Departamento Pessoal)
- RH (Recursos Humanos)
- CFG (Configurações) — muda o menu para telas de configuração

Contabilidade (CTB) não entra nesse rail para o usuário: o módulo ainda está em desenvolvimento.

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
  - No cadastro CLT, o período de experiência fica em Vínculo previsto: Sem experiência, 30+30 dias, 45+45 dias ou 90 dias
  - Prestador de serviço, intermitente, aprendiz e estágio não têm esse campo
- Pessoas → `/collaborator/people`

### Pagamentos

- Pagamentos → `/payments`

## RH — Recursos Humanos

- Painel (dashboard) → `/dashboard`

### Colaboradores (compartilhado com DP)

- Admissão → `/collaborator/admission`
  - No cadastro CLT, o período de experiência fica em Vínculo previsto: Sem experiência, 30+30 dias, 45+45 dias ou 90 dias
  - Prestador de serviço, intermitente, aprendiz e estágio não têm esse campo
- Pessoas → `/collaborator/people`

### Recrutamento

- Vagas → `/job-vacancy` (lista, candidaturas no accordion, processo/kanban)
- Candidatos → `/candidate`
- Candidaturas → `/job-vacancy-application`

### Experiência

- Avaliação de experiência → `/experience`
  - Fila automática (sem cadastro manual / sem botão Novo)
  - O período é escolhido na Admissão, cadastro CLT, seção Vínculo previsto: 30+30 dias, 45+45 dias ou 90 dias. Sem experiência não entra na fila
  - Prestador de serviço, intermitente, aprendiz e estágio não têm o campo
  - Lista vazia em "Em período" = ninguém com um desses períodos em andamento
  - Abas: Em período / Decididos

### Outros

- Férias (visão RH) → rota de férias do módulo Pessoas
- Entrevista de desligamento → `/exit-interview`
- PDI → `/development-plan`
- Desempenho → `/performance`

### Insights

- Relatórios → `/report`

## Contabilidade

O módulo de Contabilidade está em desenvolvimento e ainda não faz parte do que o cliente usa.

Se a pergunta for sobre esse módulo, responda só que está em desenvolvimento e que em breve estará no Gesint. Não ofereça caminho de menu, rota ou deep link. Não descreva folha, benefícios ou fiscal como telas disponíveis. Não diga que já dá para contratar ou habilitar.

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

- Se perguntarem "onde fica X", indique domínio (DP/RH/CFG), caminho de menu e a rota quando útil.
- Pergunta sobre o módulo de Contabilidade não é "onde fica": responda que está em desenvolvimento e em breve entra no Gesint. Não indique domínio, menu nem rota.
- Se não souber, diga que a base ainda está sendo enriquecida e sugira a busca global do header.
- Não invente telas que não estejam neste mapa.
