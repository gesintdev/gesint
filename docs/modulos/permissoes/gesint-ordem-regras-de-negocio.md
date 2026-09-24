# Gesint: ordem de construção das regras de negócio
### Ciclo de vida completo, com Recrutamento e Seleção como porta de entrada

Versão 1.3 · 23 set 2026 · Leo Junio Gomes Silva
*v1.3: correções da auditoria das telas (Portaria 671/2021, alçada, aviso prévio, competências e banco de talentos já existentes).*
*v1.2: recalibrada após leitura do código (`gommo@cb764f67`). Ver a seção 6 e `gesint-RN-03-autorizacao.md`.*
*v1.1: incorpora revisão adversarial de dependências, lacunas e afirmações regulatórias.*
*Telas de cada regra: `gesint-telas-regras-de-negocio.html`.*

---

## 0. Princípio de ordenação

A ordem segue a **dependência de dados**. Não segue a visibilidade do módulo nem a ordem cronológica da jornada do usuário.

Uma regra só é escrita depois que as entidades que ela consome estiverem definidas. O candidato entra pelo R&S, mas as regras do R&S **consomem** estrutura organizacional, cargo, competências, autorização e o formato de destino da admissão. Por isso o R&S está no meio da sequência, e não no começo.

Três consequências:

1. **A camada 0 não aparece para o cliente e vem primeiro.** Tudo que vem depois pergunta "quem pode ver isso?" e "a qual empresa ou estabelecimento isso pertence?".
2. **O destino é definido antes da origem.** A admissão completa (camada 2) vem antes da conversão candidato → admissão (camada 3). Não dá para mapear campos para um formulário que ainda está incompleto.
3. **Existem duas trilhas paralelas:** a técnica (entidades e fluxos, com o Flávio) e a de conteúdo (competências, biblioteca de questões e inventário próprio, com o Leo). Elas se encontram em pontos de controle definidos (seção 3).

---

## 1. Sequência

### CAMADA 0: Fundações transversais
> Sem estas regras, qualquer módulo construído depois precisa ser refeito.

| Ordem | Código | Regra de negócio | Depende de | Conteúdo mínimo |
|---|---|---|---|---|
| 0.1 | **RN-00** | **Modelo canônico de Pessoa** | — | `Pessoa` é a mesma entidade durante toda a vida no tenant. `Candidato` e `Colaborador` são **papéis/estados** dessa pessoa, não cadastros separados. Chave de deduplicação: CPF, com e-mail/telefone como alternativa antes de o CPF existir. |
| 0.2 | **RN-01** | **Estrutura organizacional** | RN-00 | Tenant → Empresa (CNPJ) → Estabelecimento → Departamento/Centro de custo → Equipe (gestor responsável). É daqui que saem os **escopos** da autorização. |
| 0.3 | **RN-01b** | **Vínculo** | RN-00, RN-01 | Vínculo = Pessoa + Empregador (CNPJ/estabelecimento) + período. Uma pessoa pode ter vários vínculos ao longo do tempo (recontratação). Os tipos de vínculo ficam na RN-13. |
| 0.4 | **RN-02** | **Classificação de dados e ciclo de retenção (LGPD)** | RN-00 | Quatro classes de campo: comum, pessoal, sensível (saúde, raça/cor, deficiência) e financeiro. Base legal por finalidade. Retenção por estado: candidato reprovado, banco de talentos (com consentimento), colaborador ativo e ex-colaborador (prazos legais). Regra de coleta: **dado sensível nunca antes da pré-admissão**, com uma exceção: **autodeclaração opcional** (PCD, raça/cor) para vagas afirmativas ou cotas e para monitorar impacto adverso. Exige consentimento específico, fica guardada em separado e é **invisível para quem avalia**. Saúde ocupacional guarda a conclusão do ASO (apto/inapto), **não o CID** (LGPD-01). |
| 0.5 | **RN-03** | **Autorização** | RN-01, RN-02 | Papel × Ação × Escopo × Classe de campo. Atribuição = usuário + papel + escopo. Identidades externas (candidato, depois colaborador em autoatendimento e contador) sem acesso ao tenant. Log obrigatório de acesso a campo sensível. Verificação sempre no backend. |
| 0.6 | **RN-04** | **Versionamento com vigência** | — (paralela) | Princípio da Matriz de exames aplicado a todas as entidades normativas: cargos, faixas, políticas, etapas de pipeline, instrumentos. Precisa responder "o que valia nesta data?". |
| 0.7 | **RN-05** | **Auditoria e decisão humana registrada** | RN-03 | Toda decisão que afeta uma pessoa (reprovar, aprovar, desligar) registra autor, momento, motivo padronizado e evidência. É a base para o art. 20 da LGPD (revisão de decisão automatizada) e para a defesa trabalhista. |
| 0.8 | **RN-06** | **Saúde ocupacional (existente: Matriz de exames + vínculo PGR)** | RN-04 | Já existe e está madura. Precisa de código próprio porque RN-11, RN-20 e RN-21 dependem dela. Documentar as regras atuais antes de consumir. |
| 0.9 | **RN-07** | **Prazos e notificações** | RN-03, RN-05 | Motor único de prazos: cálculo, alerta, escalonamento e destinatário por papel/escopo. Atende o SLA do candidato (RN-34), o vencimento da experiência (RN-41), o exame demissional e os prazos do eSocial (RN-21). |

**Ponto de controle G0:** matriz de permissões aprovada, testes automatizados de autorização passando e perfis atuais migrados.

---

### CAMADA 1: Arquitetura de cargos e competências
> É a espinha que liga R&S, admissão, experiência, desempenho e Plano de Cargos e Salários.

| Ordem | Código | Regra de negócio | Depende de | Conteúdo mínimo |
|---|---|---|---|---|
| 1.1 | **RN-10** | **Catálogo de competências** | RN-04 | **Evolui o catálogo que já existe para o PDI** (`Competency` + "Níveis de proficiência"). Competência = nome + definição + **indicadores observáveis por nível** (1–4). Competências técnicas e comportamentais. Catálogo-base do Gesint, que o tenant pode estender. *(Trilha de conteúdo: Leo.)* |
| 1.2 | **RN-11** | **Cargo** | RN-01, RN-10 | Família/área, título, CBO, descrição (missão, responsabilidades, requisitos), competências exigidas com nível esperado, jornada padrão, adicionais, vínculo com riscos do PGR e exames da Matriz. Versionado. |
| 1.3 | **RN-12** | **Níveis e estrutura salarial** | RN-11 | Níveis por cargo (Jr/Pl/Sr ou I-II-III), faixa (mínimo, referência, máximo), tabela salarial versionada. Regra: salário fora da faixa gera exceção com alçada de aprovação. Apoio à equidade salarial e às informações complementares da Lei 14.611/2023 (empresas com 100 ou mais empregados). O relatório oficial é gerado pelo MTE; o Gesint **não promete emiti-lo**. |
| 1.4 | **RN-13** | **Tipos de vínculo e prazos contratuais** | RN-01b, RN-11 | CLT prazo indeterminado; experiência (máximo de 90 dias, **uma** prorrogação, vira indeterminado automaticamente se o prazo passar); determinado; aprendiz (cota do art. 429 da CLT, com dispensa para ME/EPP); estágio (S-2300, fora do S-2200); PJ (fora do eSocial e fora do fluxo de admissão CLT). Cada tipo define quais eventos e campos se aplicam. |

**Ponto de controle G1:** cargos-piloto de 3 famílias (ex.: atendimento, operação, administrativo) cadastrados completos, com competências e faixas.

---

### CAMADA 2: As pontas do ciclo (admissão completa e desligamento reconstruído)
> O destino do funil e a origem da reposição. Correm em paralelo com o início da camada 3.

| Ordem | Código | Regra de negócio | Depende de | Conteúdo mínimo |
|---|---|---|---|---|
| 2.1 | **RN-20** | **Admissão completa (destino da conversão)** | RN-01b, RN-02, RN-06, RN-11, RN-12, RN-13 | Completar os campos do S-2200 (ou S-2300, conforme o tipo de vínculo) que faltam (ESOC-01 do Raio-X), **conferidos contra o leiaute vigente do eSocial**. Admissão como estado do Vínculo. Exame admissional (RN-06) como **pré-requisito** para ativar o vínculo. Exportação ao contador. |
| 2.2 | **RN-21** | **Desligamento reconstruído** | RN-01b, RN-05, RN-06, RN-07 | Motivo (tabela do eSocial), tipo e datas do aviso prévio, **exame demissional como pendência com prazo** (até 10 dias após o término; dispensável se o último exame tiver até 135 dias nos graus de risco 1–2 ou até 90 dias nos graus 3–4, pela NR-7). Checklist de devolução e acessos, entrevista de desligamento (estruturada, com motivo classificado), pacote para o contador. Premissa atual, **pendente da decisão sobre folha (seção 6)**: o Gesint não calcula verbas, organiza o fluxo e entrega ao contador. Aviso prévio: pedido de demissão = 30 dias, sem proporcionalidade nem redução de jornada. Emite o **evento "posição vaga"**, que a RN-30 consome. **Não existe marca de "não recontratar"**: só o motivo registrado, para não criar lista discriminatória (Lei 9.029/95). |

**Ponto de controle G2:** uma admissão manual e um desligamento ponta a ponta no tenant de teste, validados por um profissional de DP real.

---

### CAMADA 3: Recrutamento e Seleção (funil de pré-admissão)

| Ordem | Código | Regra de negócio | Depende de | Conteúdo mínimo |
|---|---|---|---|---|
| 3.1 | **RN-30** | **Requisição de vaga** | RN-03, RN-11, RN-12, RN-13, (evento da RN-21) | Motivo: aumento de quadro ou substituição (esta criada a partir do evento "posição vaga" da RN-21). Tipo de vínculo previsto (RN-13). Cargo + nível + estabelecimento. Salário proposto validado contra a faixa. Fluxo de aprovação por alçada (gestor → RH → orçamento; salário fora da faixa sobe para a Diretoria). |
| 3.2 | **RN-31** | **Vaga** | RN-30 | Herda descrição, requisitos e competências do Cargo. Estados: rascunho, publicada, pausada, encerrada (com motivo). Vaga confidencial. Responsáveis: recrutador e gestor, que são os escopos da RN-03. Critérios eliminatórios declarados, sempre ligados ao cargo, nunca a atributo protegido. Atributo "vaga afirmativa / PCD" (ativa a autodeclaração da RN-02). |
| 3.3 | **RN-32** | **Página de carreiras e publicação** | RN-01, RN-31 | Tema (marca, cores) + blocos fixos (proposta de valor, benefícios, vagas, "um dia aqui"). Subdomínio e, depois, domínio próprio. Marcação estruturada `JobPosting` (Google for Jobs). Link compartilhável e WhatsApp. Integrações pagas (LinkedIn/Indeed) ficam **fora do MVP** até verificar as condições das APIs. Acessibilidade e prioridade para celular. |
| 3.4 | **RN-33** | **Candidatura e identidade do candidato** | RN-00, RN-02, RN-03 | Entrada sem senha (link mágico ou código). Dados mínimos: nenhum dado sensível. Consentimentos separados (processo atual e banco de talentos). Deduplicação ligando à Pessoa existente (ex-colaborador, candidato anterior). **Origem da candidatura** registrada (página, link, WhatsApp, indicação, Google for Jobs), que alimenta a RN-42. Portal do candidato: status e retirada da candidatura. |
| 3.4b | **RN-33b** | **Banco de talentos** | RN-02, RN-10, RN-33 | O menu "Banco de talentos" **já existe** (é a lista de candidatos), mas sem consentimento. Inclusão só com consentimento próprio, com validade e expiração. Busca por competência, cargo e localidade. Convite para nova vaga e renovação do consentimento. Expirado o consentimento, os dados são eliminados ou anonimizados. |
| 3.5 | **RN-34** | **Pipeline e comunicação** | RN-05, RN-31, RN-33 | Etapas configuráveis por vaga a partir de um modelo versionado. Transições permitidas. Reprovação exige **motivo padronizado + autor humano**. Prazo máximo (SLA) de retorno ao candidato e comunicação obrigatória em reprovação e encerramento. Modelos de e-mail e WhatsApp. |
| 3.6 | **RN-35** | **Avaliações (camada A)** | RN-10, RN-34 | Tipos: prova de conhecimento, questões situacionais do cargo (gabarito definido pelo gestor), amostra de trabalho e perguntas eliminatórias. Toda avaliação é ligada a uma **competência do Cargo**. Nota automática é **apoio**; avançar ou reprovar exige ação humana (RN-05). |
| 3.7 | **RN-36** | **Entrevista estruturada** | RN-10, RN-34 | Roteiro por competência, escala de 1 a 4 com indicadores observáveis (vindos da RN-10), consolidação de mais de um avaliador. Recebe as "perguntas sugeridas" do inventário (RN-51) quando ele existir. |
| 3.8 | **RN-37** | **Proposta e aprovação** | RN-12, RN-34 | Salário ofertado contra a faixa, com exceção por alçada. Registro de aceite ou recusa (com motivo). Encerramento automático das demais candidaturas da vaga, com comunicação. |
| 3.9 | **RN-38** | **Conversão candidato → admissão** | **RN-20**, RN-33, RN-37 | Muda o estado da **mesma Pessoa**. Abre a pré-admissão: coleta **aqui** os dados sensíveis e do eSocial, documentos e agendamento do exame admissional. Mapeamento campo a campo entre candidatura e admissão, sem redigitar. Dados que o candidato não confirmar não seguem adiante. **Alertas de recontratação:** ex-colaborador dispensado sem justa causa há menos de 90 dias (presunção de fraude, Portaria MTP 671/2021, arts. 311–312, que substituiu a Portaria 384/92); contrato por prazo sucedido por outro em menos de 6 meses (art. 452 da CLT). |

**Ponto de controle G3:** uma vaga real, do requisito à admissão ativa, sem nenhuma redigitação, com o tempo de cada etapa medido.

---

### CAMADA 4: Pós-contratação (fechamento do ciclo)

| Ordem | Código | Regra de negócio | Depende de | Conteúdo mínimo |
|---|---|---|---|---|
| 4.1 | **RN-40** | **Integração (onboarding)** | RN-38 | Checklist por cargo e estabelecimento, responsáveis, prazos. Primeiro ponto de contato de endomarketing. |
| 4.2 | **RN-41** | **Avaliação de experiência (45/90 dias)** | RN-07, RN-10, RN-11, RN-13, RN-38 | Avaliação pelas **mesmas competências do Cargo** usadas na seleção. Decisão de efetivar ou encerrar registrada (RN-05). Encerramento aciona a RN-21. |
| 4.3 | **RN-42** | **Indicadores de qualidade da contratação** | RN-34, RN-41, RN-21 | Tempo até contratar, conversão por etapa e por fonte, turnover até 90 dias por fonte, recrutador e cargo, correlação entre notas da seleção e notas da experiência. |

---

### CAMADA 5: Inventário comportamental próprio (trilha paralela, com pontos de controle)

| Ordem | Código | Regra de negócio | Depende de | Conteúdo mínimo |
|---|---|---|---|---|
| 5.0 | **RN-49** | **Enquadramento regulatório do instrumento** | — | **Antes de construir**, obter parecer jurídico e/ou consulta formal ao CRP-09 sobre o enquadramento. A Lei 4.119/62 (art. 13, §1º) reserva ao psicólogo métodos psicológicos em seleção profissional, e trocar o nome do instrumento não afasta isso. Definir um psicólogo com CRP como **responsável técnico pela construção do instrumento** (autoria científica, como no Lid Tech). Isso é diferente de assinar resultados individuais de candidatos, que ele não faz. |
| 5.1 | **RN-50** | **Modelo teórico e banco de itens** | RN-10, RN-49 | Dimensões (ligadas ao catálogo de competências), itens próprios ou de base de domínio público (IPIP). **Não usar itens de instrumentos protegidos.** *(Trilha de conteúdo: começa já, em paralelo às camadas 0–2.)* |
| 5.2 | **RN-51** | **Uso no processo, v0 informativo** | RN-35, RN-36, RN-50 | Enquadramento: "inventário de estilo de trabalho", nunca "teste psicológico", "personalidade" ou "diagnóstico". Relatório em comportamento provável no trabalho. **Não entra na decisão**: gera perguntas sugeridas para a entrevista (RN-36). Devolutiva ao candidato. Documentação do produto declara que não é avaliação psicológica. |
| 5.3 | **RN-52** | **Estudo piloto e evidências psicométricas** | RN-51 (dados) | Fatorial, fidedignidade (ω/α), impacto adverso por gênero, idade e raça (agregado, n mínimo, usando a autodeclaração separada da RN-02). |
| 5.4 | **RN-53** | **Calibração por critério** | RN-42, RN-52, parecer da RN-49 | Relação entre dimensões e resultados reais (experiência, turnover até 90 dias) por cargo. Só depois disso **e com o parecer da RN-49 favorável** o inventário pode ganhar peso, sempre complementar e nunca eliminatório isoladamente. |

---

## 2. Mapa de dependências (caminho crítico)

```
RN-00 Pessoa ─┬─ RN-01 Estrutura org ── RN-01b Vínculo
              └─ RN-02 Classificação ─┬─ RN-03 Autorização ── RN-05 Auditoria ── RN-07 Prazos
RN-04 Versionamento ── RN-06 Saúde ocup. (existente)    │
                                                   ▼
RN-10 Competências ── RN-11 Cargo ── RN-12 Faixas ── RN-13 Tipos de vínculo
        │                 │             │          │
        │                 ▼             ▼          ▼
        │          RN-20 Admissão completa    RN-21 Desligamento
        │                 │                        │ evento "posição vaga"
        │                 │    RN-30 Requisição ◄──┘
        │                 │         │
        │                 │    RN-31 Vaga ── RN-32 Página/Publicação
        │                 │         │
        │                 │    RN-33 Candidatura ── RN-34 Pipeline
        ├──────────────────────────────────── RN-35 Avaliações
        ├──────────────────────────────────── RN-36 Entrevista estruturada
        │                 │                        │
        │                 │                   RN-37 Proposta
        │                 └──────────────────► RN-38 CONVERSÃO
        │                                          │
        └──────────── RN-41 Experiência ◄── RN-40 Onboarding
                            │
                       RN-42 Qualidade da contratação ── RN-53 Calibração
RN-49 Parecer ── RN-50 Inventário ── RN-51 v0 ── RN-52 Piloto ──┘
```

**Caminho crítico:** RN-00 → RN-01/01b/02 → RN-03 → RN-10 → RN-11 → RN-13 → RN-20 → RN-30 → RN-33 → RN-34 → RN-37 → RN-38.

---

## 3. Trilhas paralelas e pontos de encontro

| Janela | Trilha técnica (Flávio) | Trilha de conteúdo/produto (Leo) | Encontro |
|---|---|---|---|
| 1 | RN-00 → RN-07 (inclui RN-04 e documentação da RN-06) | Matriz de permissões (validação de negócio), RN-10 catálogo de competências, **RN-49 parecer** | **G0** |
| 2 | RN-11, RN-12, RN-13 | Cargos-piloto das 3 famílias, estrutura salarial de referência, início da RN-50 | **G1** |
| 3 | RN-20, RN-21 | Roteiro de validação com profissional de DP, entrevista de desligamento | **G2** |
| 4 | RN-30 → RN-34, RN-32, RN-33b | Modelos de pipeline, modelos de comunicação, conteúdo da página de carreiras | — |
| 5 | RN-35 → RN-38 | Biblioteca de questões situacionais e roteiros de entrevista por família | **G3** |
| 6 | RN-40 → RN-42, RN-51 | Inventário v0, relatório para gestor e candidato | — |
| contínuo | — | RN-52 → RN-53, com volume de dados | — |

---

## 4. Modelo de cada documento de regra de negócio

Cada RN-xx deve ser entregue ao desenvolvimento com:

1. **Objetivo**: o problema que resolve, em uma frase.
2. **Entidades e atributos**: com a classe de dado (RN-02) de cada campo.
3. **Regras** numeradas (RN-xx.1, RN-xx.2 …): condição → consequência.
4. **Estados e transições**, quando houver.
5. **Permissões**: papel × ação × escopo (recorte da matriz RN-03).
6. **Eventos e auditoria**: o que gera log e o que dispara outro módulo.
7. **Exceções e alçadas.**
8. **Critérios de aceite**: cenários verificáveis ("dado / quando / então").
9. **Fora do escopo**: o que explicitamente não faz.

---

## 5. Pendências de verificação antes de escrever as regras

- Parecer sobre o enquadramento do inventário próprio (RN-49), **antes** de investir na construção.
- Campos do S-2200, S-2300 e S-2299 conferidos contra o **leiaute vigente** do eSocial (RN-20, RN-21).
- Condições atuais das APIs de publicação do LinkedIn e do Indeed (RN-32).
- Stack e modelo de dados atuais do Gesint (backend não inspecionado): define o esforço real da RN-03. **Depende do acesso ao GitHub.**
- Prazos de retenção por categoria de dado, com parecer jurídico (RN-02).

---

## 6. Recalibração após leitura do código (v1.2)

| Regra | O que o código mostrou | Novo status |
|---|---|---|
| RN-01 Estrutura org. | Filial = `company` com matriz e filiais (V89); departamento e cargo compartilháveis por filial | **Em grande parte pronta.** Falta centro de custo como entidade |
| RN-03 Autorização | Ação × filial × perfil por filial já existem e têm teste | **Evolução, não reescrita.** Cinco achados de segurança (SEG-01 a SEG-05) vêm primeiro |
| RN-05 Auditoria | `audit_log` existe sem uso | Ativar (decisão D7 da RN-03) |
| RN-06 Saúde ocup. | Exames maduros, com `occupationalexam:clinical` | Confirmada como existente; serve de padrão para classificação de campo |
| RN-30 a RN-37 (R&S) | Vaga, candidato, candidatura com kanban, página pública e IA de currículo já existem | **Camada 3 passa de "construir" para "adequar"**: pessoa única, dado mínimo, consentimento, motivo de reprovação, vaga ligada ao cargo e responsáveis |
| RN-38 Conversão | **Existe em versão mínima** no frontend: botão "Criar Admissão" na coluna de contratação. Copia 6 campos, fixa CLT e início = hoje, não liga a admissão à candidatura | **Reconstruir no backend**: transação única, ligação nos dois sentidos, dados da proposta e pré-admissão preenchida pelo candidato. Continua sendo a principal peça do R&S |
| RN-21 Desligamento | O plano de sprints do repositório prevê rescisão **com cálculo de verbas** | **Depende da decisão sobre a folha** (seção 7 da RN-03) |

**Decisão bloqueante:** o plano de sprints do repositório (~8 meses, centrado em folha calculada) conflita com a prioridade R&S / ciclo de vida decidida em reunião. Precisa ser resolvido com o Flávio antes de fechar o cronograma.
