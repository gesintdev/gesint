# Plano de Acao - Modulo de Afastamentos - 2026-06-24

> Documento de planejamento/continuidade. A implementacao inicial foi realizada
> na branch `codex/implementa-afastamentos-clt-pj`.
> Sequencia: implementar este plano depois de concluir as pendencias de
> `docs/analise/plano-rh-dp-grid-2026-06-23.md`.

## Objetivo

Analisar o sistema atual, identificar o que ja existe relacionado a
afastamentos, ponto, banco de horas e jornada, confrontar com as regras abaixo e
implementar o que estiver faltando ou corrigir o que estiver errado.

O modulo de Ponto ainda nao esta completo. Portanto, nao implementar o modulo
inteiro de ponto agora. Apenas adicionar as estruturas minimas necessarias para
que o modulo de Afastamento funcione corretamente e para que, futuramente, a
implementacao completa do ponto seja simples de continuar.

## Contexto de negocio

O sistema precisa permitir o cadastro e controle de afastamentos de
colaboradores, considerando impactos em:

- ponto;
- banco de horas;
- faltas;
- folha de pagamento;
- INSS;
- estabilidade;
- historico do colaborador.

## Regras principais

### 1. Atestado medico ate 15 dias

Quando o colaborador apresentar atestado medico valido com duracao de ate 15
dias:

- a ausencia deve ser justificada;
- nao deve gerar falta;
- nao deve gerar atraso;
- nao deve gerar desconto salarial;
- nao deve gerar debito no banco de horas;
- nao deve exigir compensacao futura;
- o pagamento continua sendo responsabilidade da empresa.

Regra segura para o sistema:

```text
ATESTADO_VALIDO = nao desconta salario, nao gera falta e nao mexe no banco de horas
```

### 2. Afastamento acima de 15 dias

Quando o afastamento ultrapassar 15 dias consecutivos:

- os primeiros 15 dias ficam sob responsabilidade da empresa;
- a partir do 16o dia, o colaborador deve ser encaminhado ao INSS;
- o contrato pode ficar suspenso conforme o tipo de afastamento;
- o sistema deve marcar o afastamento como necessario de encaminhamento ao INSS.

Regra:

```text
dias_afastamento > 15 -> encaminhar para INSS
```

### 3. Atestados intercalados

O sistema deve estar preparado para identificar atestados intercalados
relacionados a mesma doenca/patologia.

Exemplo:

```text
01/06 a 05/06 = 5 dias
20/06 a 30/06 = 11 dias
Total relacionado = 16 dias
```

Se forem da mesma patologia, pode ser necessario somar os periodos para avaliar
encaminhamento ao INSS.

Para isso, considerar armazenar:

- CID;
- data inicial;
- data final;
- medico;
- CRM;
- tipo de afastamento;
- colaborador;
- status.

### 4. Acidente de trabalho

Quando o afastamento for por acidente de trabalho:

- deve permitir classificacao especifica;
- deve gerar atencao para estabilidade de 12 meses apos retorno;
- deve ficar registrado no historico do colaborador.

Regra:

```text
ACIDENTE_TRABALHO -> avaliar estabilidade apos retorno
```

## Tipos de afastamento sugeridos

Verificar se ja existem enums, tabelas ou cadastros equivalentes. Se nao
existirem, implementar de forma compativel com o padrao atual do sistema.

```text
ATESTADO_MEDICO
ACIDENTE_TRABALHO
AUXILIO_DOENCA
LICENCA_MATERNIDADE
LICENCA_PATERNIDADE
ATESTADO_ACOMPANHAMENTO
OUTROS
```

## Status sugeridos

```text
PENDENTE
VALIDADO
ENCAMINHADO_INSS
APROVADO_INSS
FINALIZADO
CANCELADO
```

## Entidade sugerida: Afastamento

Criar ou ajustar a entidade conforme o padrao do projeto.

Campos minimos sugeridos:

```text
id
colaborador_id
tipo
status
data_inicio
data_fim
quantidade_dias
cid
medico
crm
observacao
necessita_inss
data_encaminhamento_inss
data_retorno
origem_atestado
criado_em
atualizado_em
```

Se o projeto ja possuir estrutura padrao de auditoria, heranca de entidade,
cliente/tenant ou usuario logado, seguir o padrao existente.

## Integracao com ponto

Como o modulo de Ponto ainda nao esta completo, implementar apenas o necessario
para que o afastamento funcione.

O afastamento deve ser capaz de gerar ou influenciar registros de ponto da
seguinte forma:

- dias cobertos por afastamento devem aparecer como ausencia justificada;
- nao devem gerar falta;
- nao devem gerar atraso;
- nao devem gerar debito no banco de horas;
- devem ser identificaveis futuramente pelo modulo completo de ponto.

Criar uma estrutura minima, caso ainda nao exista, para representar uma
ocorrencia de ponto.

Exemplo conceitual:

```text
colaborador_id
data
tipo_ocorrencia
origem
referencia_id
horas_previstas
horas_trabalhadas
impacta_banco_horas
impacta_folha
observacao
```

Tipos de ocorrencia sugeridos:

```text
TRABALHO_NORMAL
ATESTADO_MEDICO
AFASTAMENTO
FALTA
ATRASO
FERIAS
LICENCA
```

Para afastamentos:

```text
tipo_ocorrencia = AFASTAMENTO ou ATESTADO_MEDICO
origem = AFASTAMENTO
referencia_id = id do afastamento
impacta_banco_horas = false
impacta_folha = false para desconto
```

Importante: nao implementar agora a apuracao completa de ponto, jornada, escala
ou banco de horas. Apenas deixar o afastamento registravel e preparado para
integracao futura.

## Banco de horas

Afastamento validado por atestado nao deve gerar saldo negativo.

Regra:

```text
se afastamento.status = VALIDADO
e tipo = ATESTADO_MEDICO
entao banco_horas nao deve ser debitado
```

Caso ja exista banco de horas implementado parcialmente, revisar se existe
alguma logica descontando ausencia justificada. Se existir, corrigir.

## Tela de cadastro/listagem

Criar ou ajustar a tela seguindo o padrao visual e estrutural ja existente no
sistema.

Funcionalidades esperadas:

- listar afastamentos;
- cadastrar novo afastamento;
- editar afastamento;
- visualizar historico;
- filtrar por colaborador;
- filtrar por tipo;
- filtrar por status;
- filtrar por periodo;
- marcar como validado;
- marcar como encaminhado ao INSS;
- finalizar afastamento.

Campos da tela:

```text
Colaborador
Tipo de afastamento
Status
Data inicio
Data fim
Quantidade de dias
CID
Medico
CRM
Observacao
Necessita INSS
Data de encaminhamento INSS
Data de retorno
```

## Regras automaticas da tela

Ao informar data inicial e final:

- calcular quantidade de dias;
- se quantidade de dias > 15, marcar `necessita_inss = true`;
- sugerir status `ENCAMINHADO_INSS` ou exibir alerta;
- verificar afastamentos anteriores do mesmo colaborador com mesmo CID;
- sinalizar possivel soma de periodos.

## Validacoes

Implementar validacoes minimas:

- colaborador obrigatorio;
- tipo obrigatorio;
- data inicio obrigatoria;
- data fim obrigatoria;
- data fim nao pode ser menor que data inicio;
- status obrigatorio;
- CID opcional, mas recomendado;
- CRM opcional, mas recomendado;
- se tipo for acidente de trabalho, permitir sinalizar estabilidade futura;
- impedir duplicidade conflitante de afastamento no mesmo periodo para o mesmo
  colaborador.

## Tarefas para o Codex

1. Ler o projeto inteiro e entender os padroes existentes.
2. Identificar se ja existem entidades, enums, services, repositories ou telas
   relacionadas a:
   - colaborador;
   - afastamento;
   - ponto;
   - banco de horas;
   - jornada;
   - folha.
3. Reaproveitar o que ja existir.
4. Corrigir regras existentes que conflitem com este plano.
5. Implementar o modulo de afastamento seguindo os padroes atuais do projeto.
6. Criar somente as estruturas minimas de ponto necessarias para suportar
   afastamento.
7. Nao implementar o modulo completo de ponto neste momento.
8. Garantir que afastamento validado nao gere falta, atraso ou debito de banco
   de horas.
9. Criar testes unitarios para as regras principais.
10. Validar build, lint e testes ao final.

## Criterio de aceite

A implementacao sera considerada correta quando:

- for possivel cadastrar afastamento para um colaborador;
- afastamento ate 15 dias ficar sob responsabilidade da empresa;
- afastamento acima de 15 dias sinalizar INSS;
- atestado valido nao gerar falta;
- atestado valido nao gerar debito no banco de horas;
- afastamento gerar ocorrencia minima compativel com o futuro modulo de ponto;
- a implementacao seguir os padroes arquiteturais e visuais ja existentes no
  sistema;
- nao houver implementacao desnecessaria do modulo completo de ponto.

## Status da implementacao

- [x] `LeaveRequest` mantido como agregado unico de ferias/afastamentos.
- [x] Migration `V43__leave_absence_rules_and_attendance_occurrence.sql` criada:
  - status proprio de afastamento;
  - campos de CID, medico, CRM, INSS, retorno, estabilidade e dias relacionados;
  - metadados minimos em `attendance_record` para ocorrencia/origem/impactos.
- [x] Script dev `scripts/dev/sync-tenant-absence-columns.sql` criado para tenants
  existentes.
- [x] Regras automaticas no backend:
  - duracao inclusiva;
  - afastamento acima de 15 dias sinaliza INSS;
  - periodos validados com mesmo CID podem somar dias relacionados;
  - status validado/INSS/finalizado gera ocorrencias minimas de ponto;
  - atestado medico validado nao impacta banco de horas nem desconto em folha;
  - falta injustificada segue impactando banco de horas e folha;
  - acidente de trabalho sinaliza estabilidade futura.
- [x] Tela de afastamentos ampliada com FormSection em grid de 12 colunas:
  - cadastro/status;
  - atestado/origem;
  - impactos legais e operacionais;
  - documentos.
- [x] Listagem ajustada para colaborador por nome, status, periodo, dias e INSS.
- [x] Testes unitarios adicionados para regras puras em `LeaveAbsenceRulesTest`.

## Validacoes executadas

- [x] `npm.cmd exec -- tsc --noEmit` em `gommo-frontend`: passou.
- [x] `npm.cmd run lint` em `gommo-frontend`: passou com avisos existentes.
- [x] `git diff --check`: passou.
- [~] Backend nao executado: `mvn` nao esta no PATH e `mvnw.cmd test` falha com
  `Cannot start maven from wrapper`.
