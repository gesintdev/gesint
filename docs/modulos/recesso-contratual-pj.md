# Recesso contratual para prestadores PJ

> Especificação funcional e técnica para descanso previsto em contrato de
> prestação de serviços. Revisão inicial: 18/06/2026.
>
> Este documento orienta o produto e não substitui análise jurídica do contrato,
> da operação real ou das normas aplicáveis às partes.

## 1. Objetivo

Permitir que prestadores de serviço PJ tenham pausas contratuais controladas
pelo Gommo sem aplicar automaticamente direitos, cálculos ou terminologia da
CLT.

O produto deve distinguir explicitamente:

- **Férias CLT:** direito trabalhista legal do empregado.
- **Recesso contratual PJ:** condição comercial negociada entre as partes.

Na interface, ambos podem aparecer no domínio visual de "Férias e recessos",
mas devem usar regras, saldos, validações e efeitos financeiros diferentes.

## 2. Princípios obrigatórios

1. O recesso PJ somente existe quando previsto em política contratual ativa.
2. O sistema não deve presumir 30 dias, ciclo de 12 meses ou remuneração.
3. Não se aplicam automaticamente adicional de um terço, abono pecuniário,
   período concessivo, dobra, redução por faltas ou fracionamento 14/5/5.
4. Quantidade, ciclo, fracionamento, aviso, acúmulo e efeito financeiro devem
   vir da política contratual.
5. Alterações de política devem ser versionadas e não podem modificar saldos ou
   solicitações históricas.
6. A realidade da prestação prevalece sobre o nome dado ao contrato. O Gommo
   não deve concluir automaticamente pela existência ou inexistência de vínculo
   empregatício.

Base legal geral: arts. 593 a 609 do
[Código Civil](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm)
e arts. 2º, 3º e 9º da
[CLT](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

## 3. Padrão adotado

O Gommo seguirá a separação comum em sistemas HCM:

- **tipo de ausência:** classifica o evento;
- **plano ou política:** define elegibilidade e regras;
- **período e saldo:** registra dias concedidos, usados e restantes;
- **solicitação:** registra datas, aprovação e efeito financeiro.

Como referência de produto, o Dynamics 365 separa
[tipos de ausência](https://learn.microsoft.com/en-us/dynamics365/human-resources/hr-leave-and-absence-types)
dos
[planos de ausência](https://learn.microsoft.com/en-us/dynamics365/human-resources/hr-leave-and-absence-plans),
que controlam concessões, ciclos, elegibilidade, saldos e acúmulos.

## 4. Fonte de verdade

### 4.1 Admissão

A admissão PJ coleta a configuração inicial porque esse é o momento em que os
termos comerciais entram no sistema.

Esses dados não devem permanecer como única fonte de verdade na tabela de
admissão. Ao concluir a admissão, o backend deve:

1. criar ou atualizar o contrato de prestação de serviços correspondente;
2. criar a versão inicial da política de recesso vinculada ao contrato;
3. manter a admissão como registro histórico da origem dos dados.

### 4.2 Contrato

O contrato vigente é a fonte canônica da política. Renovações ou aditivos devem
criar nova versão com data de vigência, preservando a anterior.

### 4.3 Lacuna atual identificada

No fluxo atual, a admissão sincroniza o cadastro do colaborador, mas não cria ou
atualiza automaticamente `employment_contract`.

A implementação do recesso contratual deve corrigir essa lacuna. Criar apenas
campos PJ em `admission_process` deixaria o módulo de férias dependente de um
registro de onboarding e impediria versionamento contratual adequado.

## 5. Modelo de domínio proposto

### 5.1 `ContractRecessPolicy`

Representa uma versão das regras negociadas.

Campos essenciais:

| Campo                    | Finalidade                                        |
| ------------------------ | ------------------------------------------------- |
| `id`                     | Identificador UUID                                |
| `employmentContractId`   | Contrato ao qual a política pertence              |
| `enabled`                | Informa se o contrato prevê recesso               |
| `totalDaysPerCycle`      | Total de dias concedidos por ciclo                |
| `cycleMonths`            | Duração do ciclo; 12 apenas como sugestão inicial |
| `eligibilityAfterMonths` | Carência até o primeiro saldo ficar disponível    |
| `financialMode`          | Efeito comercial durante o recesso                |
| `paidPercentage`         | Percentual mantido quando o modo for proporcional |
| `allowSplit`             | Permite fracionamento                             |
| `maxSplitPeriods`        | Quantidade máxima de parcelas                     |
| `minimumSplitDays`       | Menor parcela permitida                           |
| `advanceNoticeDays`      | Antecedência mínima da solicitação                |
| `carryoverMode`          | Expira, acumula ou acumula com limite             |
| `maximumCarryoverDays`   | Limite de acúmulo, quando aplicável               |
| `effectiveFrom`          | Início da vigência desta versão                   |
| `effectiveUntil`         | Fim da vigência, quando substituída               |
| `notes`                  | Cláusula, referência ou observação contratual     |

Modos financeiros sugeridos:

- `FULLY_PAID`: valor contratual mantido integralmente.
- `UNPAID`: período sem faturamento correspondente.
- `PROPORTIONAL`: manutenção parcial conforme percentual contratado.
- `CUSTOM`: tratamento descrito em cláusula específica e revisado manualmente.

Na UI, deve-se falar em **efeito no faturamento ou valor contratual**, não em
desconto salarial.

### 5.2 `ContractRecessPeriod`

Representa o ciclo e o saldo efetivamente concedido ao prestador.

Campos essenciais:

| Campo            | Finalidade                                               |
| ---------------- | -------------------------------------------------------- |
| `id`             | Identificador UUID                                       |
| `policyId`       | Versão da política usada na geração                      |
| `collaboratorId` | Pessoa vinculada à prestação                             |
| `cycleStart`     | Início do ciclo contratual                               |
| `cycleEnd`       | Fim do ciclo contratual                                  |
| `entitledDays`   | Dias concedidos segundo a política                       |
| `usedDays`       | Dias confirmados ou concluídos                           |
| `reservedDays`   | Dias de solicitações pendentes/aprovadas                 |
| `remainingDays`  | Saldo disponível                                         |
| `status`         | Em formação, disponível, esgotado, expirado ou cancelado |

O saldo deve ser persistido e auditável. Recalcular todo o histórico apenas com
a data inicial do contrato pode alterar resultados após um aditivo.

### 5.3 `ContractRecessRequest`

Representa a solicitação operacional e suas parcelas.

Campos essenciais:

| Campo                    | Finalidade                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| `id`                     | Identificador UUID                                                         |
| `recessPeriodId`         | Saldo consumido ou reservado                                               |
| `collaboratorId`         | Prestador relacionado                                                      |
| `status`                 | Rascunho, pendente, devolvido, rejeitado, aprovado, cancelado ou concluído |
| `financialModeSnapshot`  | Regra financeira congelada no pedido                                       |
| `paidPercentageSnapshot` | Percentual vigente no pedido                                               |
| `requestedAt`            | Data da solicitação                                                        |
| `reviewedAt`             | Data da análise                                                            |
| `reviewReason`           | Motivo de devolução ou rejeição                                            |
| `notes`                  | Observações operacionais                                                   |

As parcelas devem ser itens próprios ou registros filhos com início, fim,
quantidade de dias e sequência.

## 6. Campos na admissão PJ

Quando `contractType = PJ`, o formulário deve exibir uma seção chamada
**Recesso contratual**.

Campos propostos:

1. O contrato prevê recesso?
2. Total de dias por ciclo.
3. Duração do ciclo em meses.
4. Carência para primeira utilização.
5. Tratamento financeiro durante o recesso.
6. Percentual mantido, quando proporcional.
7. Permite fracionamento?
8. Máximo de parcelas.
9. Mínimo de dias por parcela.
10. Antecedência mínima.
11. Regra de acúmulo ou expiração.
12. Limite de acúmulo, quando aplicável.
13. Observações ou referência da cláusula contratual.

Se o contrato não prevê recesso, os demais campos ficam ocultos e não deve ser
gerado saldo.

## 7. Elegibilidade e listagem

Um prestador PJ aparece na aba de pessoas aptas quando:

- possui contrato vigente;
- possui política de recesso ativa;
- cumpriu a carência definida;
- possui período com saldo disponível;
- não possui solicitação pendente ou aprovada que reserve todo o saldo daquele
  período.

Se um período estiver integralmente reservado ou consumido, o sistema procura o
próximo período disponível. Essa regra é equivalente apenas no fluxo visual à
listagem CLT; os cálculos permanecem separados.

Na grid, o regime deve ser identificado como **PJ - Recesso contratual** para
evitar interpretação de direito celetista.

## 8. Solicitação e fracionamento

O formulário pode reutilizar componentes visuais do cadastro de férias, desde
que selecione uma estratégia de domínio conforme o regime:

- `CltVacationPolicy`: regras legais de férias.
- `ContractRecessPolicy`: regras negociadas do PJ.

Para PJ:

- o total solicitado não pode superar o saldo disponível;
- o número de parcelas respeita `maxSplitPeriods`;
- cada parcela respeita `minimumSplitDays`;
- as datas não podem se sobrepor;
- não se aplicam automaticamente os mínimos CLT de 14 e 5 dias;
- não há abono pecuniário ou adicional de um terço;
- o efeito financeiro vem do snapshot da política.

## 9. Efeito financeiro

O recesso PJ não deve entrar na folha de pagamento como verba salarial.

O lançamento deve produzir uma instrução para o fluxo financeiro ou de contas a
pagar, conforme a política:

- manter valor integral;
- reduzir valor proporcionalmente aos dias sem prestação;
- suspender faturamento no período;
- encaminhar para revisão manual.

O cálculo final deve considerar o modelo comercial do contrato, por exemplo
mensalidade fixa, diária, hora, entrega ou marco. Por isso, o modo `CUSTOM` é
necessário enquanto o Gommo não modelar todos esses formatos.

## 10. Responsabilidades entre RH e DP

### RH

- visualizar política e saldo;
- iniciar solicitação;
- avaliar calendário e impacto na equipe;
- acompanhar devolução, rejeição e aprovação.

### DP ou responsável contratual

- conferir política vigente e cláusula contratual;
- validar saldo, carência, datas e fracionamento;
- confirmar efeito financeiro;
- aprovar, devolver, rejeitar ou cancelar com motivo;
- encaminhar instrução ao módulo financeiro.

O perfil aprovador deve ser configurável, pois algumas empresas tratam PJ em
Compras, Jurídico ou Financeiro, e não no Departamento Pessoal.

## 11. Versionamento e auditoria

- Uma política utilizada por período ou solicitação não pode ser excluída
  fisicamente.
- Aditivo contratual encerra a vigência anterior e cria nova versão.
- Períodos existentes mantêm referência à política que os originou.
- Solicitações guardam snapshot do tratamento financeiro.
- Mudanças de saldo devem gerar lançamentos de crédito, reserva, consumo,
  estorno ou expiração.
- Aprovação, devolução, rejeição e cancelamento devem registrar usuário, data e
  motivo.

## 12. Critérios de aceite para implementação

1. Admissão PJ permite informar ausência ou existência de recesso contratual.
2. Campos condicionais são validados somente quando a política estiver ativa.
3. Conclusão da admissão sincroniza `employment_contract`.
4. Política inicial é criada separadamente da admissão.
5. Alteração contratual cria nova versão sem reescrever o histórico.
6. PJ sem política não aparece como apto.
7. PJ com carência não cumprida não aparece como apto.
8. PJ com saldo disponível aparece identificado como recesso contratual.
9. Solicitações pendentes e aprovadas reservam saldo.
10. Fracionamento segue a política PJ e não os limites CLT.
11. Solicitação congela a regra financeira vigente.
12. Recesso PJ não gera um terço constitucional, abono ou dobra.
13. Efeito financeiro é encaminhado fora da folha salarial.
14. Todos os registros usam soft delete e trilha de auditoria do projeto.
15. Multi-tenant recebe as novas tabelas pelo catálogo e pelo seed de schema.

## 13. Decisões pendentes antes da implementação

Precisamos confirmar:

- se o primeiro ciclo concede saldo no início ou apenas após a carência;
- se o padrão inicial será 12 meses quando o contrato não especificar ciclo;
- quais modos financeiros entram no primeiro MVP;
- se acúmulo será permitido no MVP;
- qual área aprova o recesso PJ em cada cliente;
- como o módulo financeiro receberá a instrução de faturamento;
- se contratos por diária, hora e entrega serão modelados agora ou tratados
  inicialmente como `CUSTOM`.

Até essas decisões serem configuradas, o sistema não deve criar regras padrão
silenciosas para contratos PJ.
