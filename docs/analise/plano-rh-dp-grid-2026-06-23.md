# Plano RH/DP/Grid - 2026-06-23

## Objetivo

Executar o pacote de ajustes em admissao, colaboradores, ferias, afastamentos,
desligamento, notificacoes, grid paginada e movimentacao de Ponto para DP.

Este arquivo e o ponto de retorno/continuidade. Atualize o status ao finalizar
cada etapa para outra sessao ou outra IA conseguir retomar sem reanalisar tudo.

## Grupos por tela/entidade

### Admissao / AdmissionProcess

- Trocar label "Previsao de inicio" para "Data de inicio" no FE e avaliar se o
  contrato precisa manter o mesmo campo do BE (`expectedStartDate`) ou renomear
  contrato publico.
- Na secao Contrato, preencher "Inicio do contrato" com a Data de inicio, mas
  permitir edicao.
- Listagem de admissao:
  - trocar coluna de e-mail por Departamento;
  - trocar coluna "Previsao inicio" para "Data de inicio";
  - corrigir exibicao de um dia a menos se estiver ligada a formatacao local.

Impacto: pequeno/medio.

### Colaboradores / Collaborator

- Retirar colaboradores desligados da listagem principal.
- Colaboradores desligados devem ter status visual "Desligado".
- Adicionar aba adicional com historico de ferias do colaborador selecionado,
  separando "Ferias gozadas" e "Ferias atuais", com identificacao/estilo de
  abas adicionais (`additionalTabs`).
- Migrar `collaborator/people` para grid paginada server-side com filtros por
  coluna.

Impacto: medio/grande.

### Ferias / LeaveRequest

- Corrigir erro no cadastro de ferias.
- Verificar status: alem de Concedida/Reprovada, mostrar "Em ferias" quando a
  data atual estiver dentro do periodo aprovado.

Impacto: medio.

### Desligamento / Offboarding

- Corrigir coluna Colaborador, hoje exibindo ID em vez de nome.
- Corrigir coluna Tipo, hoje exibindo enum cru.
- Garantir reflexo do desligamento no status/listagem de colaboradores.

Impacto: pequeno/medio.

### Configuracoes / Notificacoes

- Adicionar configuracao de antecedencia para notificacao de ferias a vencer.
- Implementar fluxo de notificacoes do sistema.
- Quando houver notificacoes nao lidas, animar sino em intervalos de 2 segundos.

Impacto: grande.

### Afastamento / Absence

- [x] Melhorar cadastro de afastamento com tipos CLT:
  - tipos centralizados no frontend em `leave-types.ts`;
  - enum do backend ampliado preservando tipos legados;
  - labels ajustados para tabela/dashboard;
  - sem migration, pois `leave_type` ja e persistido como string.
- [x] Separar regras diretamente ligadas a ponto/banco de horas:
  - `UNJUSTIFIED_ABSENCE` passa a representar falta injustificada para calculo de ferias;
  - licencas/atestados CLT entram como ausencias justificadas;
  - licenca nao remunerada/suspensao ficam fora do calculo de faltas de ferias e seguem no impacto de folha.

Impacto: medio/grande.

### Autenticacao / Sessao

- Investigar refresh token e tempo de sessao, pois o usuario esta sendo
  deslogado em intervalo curto.
- Aumentar intervalo apenas se o problema for configuracao de expiracao.

Impacto: grande/urgente.

### Grid compartilhada

- Criar fundacao de busca paginada generica no fluxo Controller, Service e
  Repository.
- Filtros por coluna devem ser server-side e os valores unificados nao podem
  depender apenas da pagina atual.
- Criar paginacao tradicional no rodape para grids comuns.
- Criar padrao "Carregar mais" para a listagem de admissao.
- Implementar/testar inicialmente somente em `collaborator/people`.

Impacto: grande.

### Ponto / Attendance

- Mover tela de Ponto de RH/Pessoas para DP, mantendo padrao de pastas e rotas.

Impacto: grande.

## Ordem de trabalho

1. Correcoes locais de baixo risco.
2. Fundacao de grid e migracao de `collaborator/people`.
3. Mover Ponto para DP.
4. Fluxos grandes: notificacoes/configuracoes, historico adicional e auth.

## Status

- [x] Regras obrigatorias lidas.
- [x] Arquitetura inicial analisada.
- [x] Implementacoes semelhantes localizadas.
- [x] Correcoes locais implementadas parcialmente:
  - admissao: label "Data de inicio", contrato herdando data inicial quando vazio,
    coluna Departamento, correcao de data em tabela;
  - desligamento: coluna Colaborador por nome e Tipo com label;
  - colaboradores: listagem/picker excluem desligados;
  - ferias: status visual "Em ferias" para periodo aprovado em andamento.
- [x] Grid paginada/filtravel implementada em `collaborator/people`:
  - `QueryPagedTablePanel`;
  - paginacao de rodape;
  - filtros por coluna com opcoes vindas do backend.
- [x] Aba adicional de historico de ferias na tela de admissao:
  - aba extra "Historico de ferias" em `collaborator/admission`;
  - separacao entre "Ferias atuais" e "Ferias gozadas";
  - reutilizacao do status visual de ferias do RH;
  - botao de rodape para lancamento de ferias quando o colaborador estiver apto.
- [x] Desligamento movido para DP:
  - removido do menu RH/Pessoas;
  - adicionado como menu direto em DP, ao lado de Ferias e Afastamento;
  - pacote frontend movido para `gommo-frontend/src/modules/dp/offboarding/**`;
  - pacote backend movido para `br.com.gommo.modules.dp.offboarding`;
  - permissao `offboarding:*` passou para o escopo DP no catalogo de permissoes.
- [~] Ponto movido para DP:
  - removido do menu RH/Pessoas;
  - adicionado em DP/Organizacao;
  - pacote fisico/backend ainda permanece em `rh/person/attendance` para evitar
    quebra ampla sem validacao Java completa.
- [~] Validacoes executadas:
  - `npm.cmd run lint --prefix gommo-frontend`: passou com avisos existentes;
  - `npm.cmd exec -- tsc --noEmit` em `gommo-frontend`: passou;
  - backend nao compilado porque `mvn` nao esta no PATH e o wrapper `gommo-backend/mvnw.cmd`
    falhou com `Cannot start maven from wrapper`;
  - `npm.cmd exec -- tsc --noEmit` em `gommo-frontend`: passou apos ajuste de Tipos de Afastamento.
- [x] Configuracoes/notificacoes de ferias a vencer implementadas:
  - tabela/configuracao `system_setting` para antecedencia de ferias a vencer;
  - tabela `system_notification` para notificacoes do sistema;
  - endpoint de resumo/nao lidas com geracao idempotente de avisos de ferias a vencer;
  - tela CFG > Notificacoes para ajustar antecedencia;
  - sino do header com popover, contador, marcar como lida e animacao a cada 2 segundos quando houver nao lidas.
- [~] Validacoes executadas apos notificacoes:
  - `npm.cmd exec -- tsc --noEmit` em `gommo-frontend`: passou;
  - `npm.cmd run lint` em `gommo-frontend`: passou com avisos existentes;
  - backend nao compilado porque `mvn` nao esta no PATH e o wrapper `gommo-backend/mvnw.cmd`
    falhou com `Cannot start maven from wrapper`.
- [x] Autenticacao/sessao investigada:
  - expiracao configurada segue em 15 minutos para access token e 7 dias para refresh token;
  - causa provavel do logout curto era refresh manual em `api.client.ts`, que rotacionava o refresh token no backend sem persistir o novo refresh token no JWT do NextAuth;
  - cliente HTTP passou a delegar refresh para `getSession()`/NextAuth, evitando invalidar a sessao por refresh token antigo;
  - `npm.cmd exec -- tsc --noEmit` em `gommo-frontend`: passou;
  - `npm.cmd run lint` em `gommo-frontend`: passou com avisos existentes.

## Pendencias importantes

- Compilar backend com Maven assim que houver Maven/wrapper disponivel.
- Refatorar fisicamente Ponto para `dp/.../attendance` no frontend e backend,
  atualizando imports do payroll.
- Trocar a implementacao inicial de filtros de `collaborator/people` para queries
  de banco dedicadas antes de escalar para bases grandes.
- Monitorar em uso real se a sessao permanece ativa apos expiracao do access token.
- Monitorar a implementacao inicial do plano de afastamentos CLT/PJ em uso real.

## Proximo plano

- Depois de concluir as pendencias acima, continuar pelo plano detalhado de
  afastamentos em `docs/analise/plano-afastamentos-2026-06-24.md`.

## Arquivos ja identificados

- `gommo-frontend/src/modules/rh/person/collaborators/admission/**`
- `gommo-backend/src/main/java/br/com/gommo/modules/rh/person/collaborators/admission/**`
- `gommo-frontend/src/modules/rh/person/collaborators/people/**`
- `gommo-backend/src/main/java/br/com/gommo/modules/rh/person/collaborators/people/**`
- `gommo-frontend/src/modules/dp/offboarding/**`
- `gommo-backend/src/main/java/br/com/gommo/modules/dp/offboarding/**`
- `gommo-frontend/src/shared/components/ui/DataTable.tsx`
- `gommo-frontend/src/shared/components/data/QueryPanel.tsx`
- `gommo-backend/src/main/java/br/com/gommo/core/base/**`
- `gommo-frontend/src/auth.ts`
- `gommo-frontend/src/auth/refresh-token.ts`
