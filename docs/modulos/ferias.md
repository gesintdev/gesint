# Férias e descanso contratual

> Referência funcional e normativa para os módulos de Férias do RH e do DP.
> Revisão: 17/06/2026.
>
> Este documento orienta requisitos de produto e validações do sistema. Ele não
> substitui avaliação jurídica, convenção coletiva, acordo coletivo ou política
> interna aplicável a cada empresa e categoria profissional.

## 1. Escopo e linguagem do domínio

O Gommo atende dois regimes com naturezas diferentes:

- **CLT:** férias anuais remuneradas são direito trabalhista obrigatório.
- **PJ:** não existe direito legal automático a férias remuneradas. Pode existir
  **recesso contratual**, remunerado ou não, se previsto no contrato de
  prestação de serviços.

O sistema não deve aplicar silenciosamente regras de CLT a prestadores PJ. Para
PJ, prazo, quantidade de dias, remuneração, aviso, fracionamento e acumulação
dependem do contrato.

### 1.1 Termos CLT

- **Período aquisitivo:** ciclo de 12 meses em que o empregado adquire o direito
  às férias.
- **Período concessivo:** 12 meses seguintes ao término do período aquisitivo,
  durante os quais o empregador deve conceder o descanso.
- **Gozo:** dias corridos em que o empregado efetivamente está de férias.
- **Saldo:** dias adquiridos ainda não gozados nem convertidos em abono.
- **Abono pecuniário:** conversão, por opção do empregado, de até um terço dos
  dias de férias em dinheiro.
- **Férias vencidas:** neste documento, direito cujo período concessivo terminou
  sem a concessão integral. Não confundir com férias apenas adquiridas e ainda
  dentro do prazo concessivo.

## 2. Regras obrigatórias para empregados CLT

### 2.1 Direito e períodos

1. Todo empregado tem direito anual a férias sem prejuízo da remuneração.
2. O primeiro período aquisitivo começa na admissão e dura 12 meses.
3. Os períodos seguintes sucedem-se em ciclos de 12 meses, salvo evento legal
   que provoque perda e reinício da contagem.
4. Adquirido o direito, o empregador tem os 12 meses seguintes para conceder as
   férias.
5. Para controle preventivo, o Gommo deve considerar o período integral de gozo
   dentro do limite concessivo. Situações que atravessem o limite devem ser
   bloqueadas ou encaminhadas para análise explícita do DP.
6. A concessão depois do prazo do art. 134 gera pagamento em dobro da
   remuneração correspondente, conforme art. 137 da CLT.

Base legal: arts. 129, 134 e 137 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.2 Quantidade de dias e faltas injustificadas

Os dias são corridos. A quantidade adquirida depende das faltas injustificadas
ocorridas no respectivo período aquisitivo:

| Faltas injustificadas | Direito adquirido |
|---:|---:|
| 0 a 5 | 30 dias |
| 6 a 14 | 24 dias |
| 15 a 23 | 18 dias |
| 24 a 32 | 12 dias |
| Mais de 32 | Sem direito naquele período |

As faltas não são descontadas uma a uma dos dias de férias. Elas posicionam o
empregado em uma das faixas do art. 130. Ausências legalmente justificadas não
devem ser contadas como faltas para essa redução.

Base legal: arts. 130 e 131 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.3 Eventos que podem causar perda do período

O empregado perde o direito relativo ao período aquisitivo em andamento quando,
naquele ciclo, ocorrer uma das hipóteses do art. 133 da CLT:

- deixar o emprego e não for readmitido em até 60 dias;
- permanecer em licença remunerada por mais de 30 dias;
- deixar de trabalhar, com percepção de salário, por mais de 30 dias em razão de
  paralisação total ou parcial dos serviços da empresa;
- receber prestações previdenciárias por acidente de trabalho ou
  auxílio por incapacidade temporária por mais de 6 meses, ainda que em períodos
  descontínuos.

Nas hipóteses legais aplicáveis, um novo período aquisitivo começa no retorno ao
serviço. O sistema deve guardar o motivo, as datas e a origem da interrupção;
não basta transformar todos os afastamentos em faltas injustificadas.

Base legal: arts. 131 a 133 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.4 Concessão, escolha e fracionamento

- A época das férias é definida pelo empregador, considerando seus interesses.
- A solicitação do empregado e a aprovação gerencial fazem parte do fluxo
  organizacional, mas não substituem a concessão formal pelo empregador.
- Com concordância do empregado, as férias podem ser divididas em até 3
  períodos.
- Um dos períodos deve ter no mínimo 14 dias corridos.
- Cada um dos demais deve ter no mínimo 5 dias corridos.
- Sem concordância do empregado, o fracionamento não deve ser imposto.
- Membros da mesma família no mesmo estabelecimento podem solicitar férias no
  mesmo período quando isso não prejudicar o serviço.
- Empregado estudante menor de 18 anos pode fazer coincidir as férias com as
  férias escolares.
- A antiga obrigação de período único para menores de 18 e maiores de 50 anos
  foi revogada. O sistema não deve manter essa restrição.

Base legal: arts. 134 e 136 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.5 Data de início e comunicação

- É proibido iniciar as férias nos 2 dias que antecedem feriado ou o repouso
  semanal remunerado do empregado.
- O repouso semanal não deve ser presumido como domingo para todos. Deve vir da
  escala ou jornada contratual quando ela estiver disponível.
- Feriados nacionais, estaduais e municipais aplicáveis ao local de trabalho
  devem ser considerados.
- A concessão deve ser comunicada por escrito com antecedência mínima de 30
  dias, com registro do recebimento.
- A concessão deve ser registrada nos sistemas trabalhistas aplicáveis.

Base legal: arts. 134, parágrafo 3, e 135 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.6 Remuneração e pagamento

- Durante as férias, o empregado recebe a remuneração devida na data da
  concessão.
- A remuneração de férias tem adicional constitucional de pelo menos um terço.
- Salário variável, tarefa, comissão, utilidades e adicionais habituais exigem
  as médias e composições previstas no art. 142; usar apenas o salário-base pode
  produzir valor incorreto.
- O pagamento da remuneração das férias e do abono, quando houver, deve ocorrer
  até 2 dias antes do início do gozo.
- O atraso no pagamento continua sendo irregular. Entretanto, atraso isolado no
  pagamento não deve gerar automaticamente a dobra do art. 137: o STF declarou
  inconstitucional a aplicação da antiga Súmula 450 do TST na ADPF 501. A dobra
  legal permanece para concessão fora do período concessivo.

Base legal: art. 7, XVII, da
[Constituição Federal](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm),
arts. 137, 142 e 145 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
e [ADPF 501 no STF](https://portal.stf.jus.br/processos/detalhe.asp?incidente=5336275).

### 2.7 Abono pecuniário

- A conversão é uma faculdade do empregado, não do empregador.
- O empregado pode converter em abono até um terço do período a que tiver
  direito.
- O limite deve ser calculado sobre o direito efetivo: 10 dias para direito de
  30; 8 para 24; 6 para 18; 4 para 12.
- O pedido deve ser feito até 15 dias antes do fim do período aquisitivo.
- Em férias coletivas, a conversão depende de acordo coletivo com o sindicato,
  sem requerimento individual.
- Dias gozados + dias convertidos em abono não podem superar o direito
  adquirido.

Base legal: arts. 143 e 145 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.8 Férias coletivas

- Podem abranger toda a empresa, estabelecimento ou setor.
- Podem ser divididas em até 2 períodos anuais, nenhum inferior a 10 dias
  corridos.
- Devem ser comunicadas ao órgão local do Ministério do Trabalho e aos
  sindicatos representativos com antecedência mínima de 15 dias, além da
  afixação de aviso nos locais de trabalho.
- Exigem registros próprios.
- Empregado com menos de 12 meses goza férias proporcionais e inicia novo
  período aquisitivo ao início das férias coletivas.

Férias coletivas não devem reutilizar, sem adaptação, a validação de
fracionamento das férias individuais.

Base legal: arts. 139 a 141 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

### 2.9 Rescisão

O encerramento do contrato pode exigir pagamento de férias adquiridas,
eventualmente em dobro, e férias proporcionais. A proporção considera 1/12 por
mês de serviço ou fração superior a 14 dias, observada a causa da rescisão e as
regras legais aplicáveis.

Base legal: arts. 146 a 148 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

## 3. Prestadores PJ: recesso contratual

### 3.1 Natureza jurídica

A prestação de serviços não sujeita à lei trabalhista rege-se pelo contrato e
pelo Código Civil. Por isso, o prestador PJ não adquire automaticamente:

- 30 dias de férias;
- adicional constitucional de um terço;
- período aquisitivo ou concessivo da CLT;
- abono pecuniário;
- pagamento em dobro;
- aviso legal de férias com 30 dias.

Base legal: arts. 593 a 609 do
[Código Civil](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm).

### 3.2 Prática contratual recomendada

O mercado pode negociar um recesso para continuidade saudável da relação
comercial. O Gommo deve tratar essas regras como parâmetros do contrato, nunca
como direito CLT presumido:

- quantidade de dias por ciclo contratual;
- data de elegibilidade e forma de renovação do saldo;
- recesso remunerado, parcialmente remunerado ou sem faturamento;
- manutenção da mensalidade, faturamento proporcional ou pausa de cobrança;
- antecedência para solicitação e aprovação;
- possibilidade e limites de fracionamento;
- acumulação, expiração ou indenização de saldo;
- impacto em entregas, níveis de serviço e substituição;
- tratamento do saldo no encerramento do contrato.

Se o contrato for omisso, o sistema não deve inventar remuneração ou saldo.
Pode registrar uma pausa operacional, mas deve sinalizar que os efeitos
financeiros dependem de validação contratual.

### 3.3 Risco de enquadramento incorreto

Chamar a relação de PJ ou escrever um contrato comercial não afasta, por si só,
um eventual vínculo de emprego. A realidade da prestação deve ser avaliada a
partir dos elementos legais, incluindo pessoalidade, não eventualidade,
onerosidade e dependência/subordinação. Atos destinados a fraudar a CLT são
nulos.

Base legal: arts. 2, 3 e 9 da
[CLT consolidada](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm).

O Gommo pode alertar sobre a diferença de regime, mas não deve emitir conclusão
automática sobre existência ou inexistência de vínculo empregatício.

## 4. Separação funcional entre RH e DP no Gommo

Os dois módulos tratam o mesmo ciclo, mas possuem responsabilidades diferentes.

### 4.1 Férias no RH

Foco em pessoas, planejamento e comunicação:

- visualizar elegibilidade e saldo previsto;
- permitir que o empregado ou RH proponha datas;
- consultar conflitos de equipe e capacidade operacional;
- registrar concordância com fracionamento;
- acompanhar solicitação, devolução, rejeição e aprovação;
- exibir histórico e motivos de devolução;
- encaminhar a solicitação ao DP.

A aprovação no RH representa anuência organizacional. Ela não deve, sozinha,
marcar as férias como legalmente concedidas nem gerar pagamento.

### 4.2 Férias no DP

Foco em conformidade, concessão e efeitos trabalhistas:

- confirmar contrato e regime CLT ou PJ;
- apurar período aquisitivo e concessivo correto;
- validar afastamentos, faltas e eventos que reiniciam o período;
- validar saldo, fracionamento, repouso semanal e feriados aplicáveis;
- revisar abono pecuniário e prazo do requerimento;
- formalizar aviso e concessão;
- calcular ou encaminhar bases de remuneração e médias para a folha;
- controlar prazo de pagamento, dobra e registros obrigatórios;
- devolver ou rejeitar solicitação com motivo auditável.

### 4.3 Domínio compartilhado

RH e DP devem consultar uma única fonte de verdade para:

- contrato vigente e regime;
- períodos aquisitivos;
- períodos concessivos;
- saldo por período;
- parcelas de gozo e abono;
- faltas e afastamentos considerados;
- status da solicitação e da concessão;
- trilha de auditoria.

As telas podem ter ações e visões diferentes, mas não podem recalcular regras de
forma divergente. Regras legais devem ficar no backend/domínio; o frontend pode
apenas antecipar validações para melhorar a experiência.

## 5. Estados recomendados para o fluxo

Os nomes finais devem respeitar os enums e padrões do projeto, mas o domínio
precisa distinguir pelo menos:

| Estado funcional | Significado |
|---|---|
| Em aquisição | Os 12 meses ainda não terminaram |
| Adquirido | Direito formado e dentro do período concessivo |
| Solicitado ao DP | RH enviou proposta para análise |
| Devolvido ao RH | Ajustes foram solicitados |
| Rejeitado | Pedido encerrado com motivo |
| Aprovado pelo DP | Datas e regras foram validadas |
| Concedido | Aviso/concessão formalizados |
| Programado para pagamento | Integrado ao processamento financeiro |
| Pago | Pagamento confirmado |
| Em gozo | Período de descanso em andamento |
| Concluído | Gozo encerrado e saldo atualizado |
| Vencido | Prazo concessivo expirou com saldo pendente |
| Perdido | Direito perdido por hipótese legal identificada |
| Cancelado | Programação cancelada com motivo e auditoria |

Solicitação, concessão, pagamento e gozo são eventos diferentes. Um único campo
`approved` não representa adequadamente todo o ciclo.

## 6. Critérios para a futura auditoria da implementação

A verificação profunda do fluxo atual deve conferir, no mínimo:

1. Cálculo de todos os períodos, e não apenas um período inferido pela admissão.
2. Reinício do período aquisitivo nas hipóteses do art. 133.
3. Distinção entre faltas injustificadas, ausências justificadas e afastamentos
   previdenciários.
4. Contagem de mais de 6 meses de benefício, inclusive descontínuos.
5. Saldo persistido por período e consumo atômico por parcelas.
6. Fracionamento individual com concordância e limites 14/5/5.
7. Regra separada para férias coletivas.
8. Repouso semanal vindo da escala, sem presumir domingo universalmente.
9. Calendário nacional, estadual e municipal por local de trabalho.
10. Antecedência de 30 dias para comunicação.
11. Prazo do pedido de abono e limite de um terço do direito efetivo.
12. Base de remuneração com médias e adicionais, sem limitar ao salário-base.
13. Prazo de pagamento e dobra apenas nas hipóteses juridicamente cabíveis.
14. Diferença entre aprovação do RH, aprovação do DP, concessão e pagamento.
15. Idempotência ao aprovar grupos de períodos fracionados.
16. Bloqueio de sobreposição entre férias, afastamentos e outros períodos.
17. Tratamento de alteração, cancelamento e retorno antecipado com auditoria.
18. Segregação de permissões entre solicitante do RH e aprovador do DP.
19. Regras de PJ configuradas por contrato e sem cálculos CLT automáticos.
20. Integração coerente com folha, pagamentos e desligamento.

## 7. Fontes normativas primárias

- [Constituição Federal, art. 7, XVII](https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm)
- [CLT consolidada, arts. 2, 3, 9 e 129 a 153](https://www.planalto.gov.br/ccivil_03/decreto-lei/del5452.htm)
- [Código Civil, arts. 593 a 609](https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm)
- [STF, ADPF 501](https://portal.stf.jus.br/processos/detalhe.asp?incidente=5336275)

Convenções coletivas, acordos coletivos, regimes especiais e normas posteriores
podem ampliar direitos ou alterar procedimentos. Antes de automatizar uma regra
por categoria, o sistema deve permitir identificar a norma aplicável e sua
vigência.
