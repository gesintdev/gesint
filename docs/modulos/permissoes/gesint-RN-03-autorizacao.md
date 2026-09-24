# RN-03: Autorização
### Diagnóstico do código atual, decisões propostas e matriz de permissões

Versão 1.2 · 23 set 2026 · Leo Junio Gomes Silva
Base: repositório `flaviohenriquedev/gommo`, commit `cb764f67` (main)
Método: leitura de código e migrations, com **auditoria independente** de cada afirmação feita por um segundo agente (arquivo:linha). **Nada foi executado.** "Confirmado" nesta versão significa confirmado **por leitura de código por duas fontes independentes**. A prova definitiva é o teste de reprodução previsto em cada achado.

*v1.2: segunda auditoria. Corrigido o dado de nascimento na conversão, SEG-04 com perda de dado e perfil Auditor na matriz.*
*v1.1: auditoria independente. SEG-01 (agravante) e o cenário do candidato passam de "a confirmar" para "confirmado por leitura". Novos: SEG-03, SEG-04 e SEG-05. Corrigido: a conversão candidato → admissão **existe em versão mínima** (seção 6). Seção 7 matizada.*

---

## 1. Sumário executivo

**O modelo de autorização do Gesint está mais maduro do que o Raio-X de agosto supôs.** O Raio-X olhou só as telas e concluiu "permissão por menu". O backend tem mais do que isso:

- **Permissão por ação**: authorities `modulo:acao` (`leave:read`, `candidate:write`, `developmentplan:approve`…) checadas com `@PreAuthorize` no service. São 452 anotações.
- **Escopo por filial (estabelecimento/CNPJ)**: filtro do Hibernate aplicado automaticamente a todo repositório (`BranchScopeAspect`), com teste que faz o build falhar se uma entidade esquecer o filtro.
- **Perfil por filial**: o mesmo usuário pode ser admin de RH na filial A e só consultar ponto na filial B (`user_role.company_id`).
- **Isolamento entre clientes**: um schema PostgreSQL por cliente.
- **Um precedente de classificação de campo**: `occupationalexam:clinical` esconde CID, observações e resultado do ASO de quem não tem essa authority.

**Conclusão:** a RN-03 é uma **evolução** do que existe, não uma reescrita. A base de ação × filial fica. Faltam três coisas:

1. **Escopo abaixo da filial**: departamento, equipe do gestor, vaga atribuída e "somente o próprio".
2. **Classificação de campo generalizada**: hoje existe só em Exames.
3. **Trilha de auditoria**: a tabela `audit_log` existe, mas nenhum código grava nela.

E há **cinco achados de segurança** (SEG-01 a SEG-05, três de severidade alta) para corrigir antes de qualquer piloto (seção 3).

---

## 2. Estado atual (com evidência)

| Dimensão | Existe? | Evidência |
|---|---|---|
| Isolamento entre clientes | ✅ Sim | Um schema por cliente; `TenantSchemaDataSource`, `TenantAuthValidator` compara o tenant do token com o do host |
| Ação (`modulo:acao`) | ✅ Sim | `permission`, `role_permission`, `@PreAuthorize("hasAuthority(...)")` nos services |
| Perfis tipados | ✅ Sim | `RoleTypeEnum`: GLOBAL_ADMIN, ADMIN (um por sistema), INTERNAL (HR, MOBILE, SESMT), CUSTOM |
| Sistema contratado | ✅ Sim | `AccessScopePolicy.isSystemContracted`: DP/RH/CTB só com contrato ativo, inclusive por filial |
| Escopo por filial | ✅ Sim | `BranchScopedEntity` + `@Filter`, `BranchScopeAspect`, `X-Branch-Id`, `BranchAccessResolver` |
| Perfil diferente por filial | ✅ Sim | `V89`/`V90`: `user_role.company_id` (nulo = todas as filiais) |
| Anti-escalada | ✅ Sim | `AccessScopePolicy`: quem cria um perfil só concede o que ele próprio tem |
| Escopo por departamento/equipe | ❌ Não | `Department.responsibleCollaboratorIds` existe, mas não restringe nada |
| Escopo por registro atribuído (vaga → recrutador) | ❌ Não | `JobVacancy` não tem responsável |
| "Somente o próprio" (autoatendimento) | 🟡 Parcial | Usuário ligado a colaborador (`collaboratorId`) recebe authorities pessoais; não existe regra geral de "só os meus registros" |
| Classificação de campo | 🟡 Parcial | Só em Exames (`occupationalexam:clinical`). Afastamento expõe CID a qualquer um com `leave:read` (`LeaveRequestMapper`, linha 125) |
| Trilha de auditoria | ❌ Não | `audit_log` sem código; só `created_by/updated_by` (`AuditEntity`) |
| Identidade externa (candidato) | 🟡 Parcial | `/api/v1/public/careers`: candidatura anônima, sem sessão nem portal. Colaborador tem `access_code` para ponto e app |
| Testes de autorização | 🟡 Parcial | Existem testes do filtro de filial; não há matriz de testes por papel |

---

## 3. Achados de segurança (corrigir antes do piloto)

### SEG-01: Anexos acessíveis sem checar a entidade dona (severidade alta)

**Leitura do código:**

- `BranchAccessResolver.PERSONAL_AUTHORITIES` dá `storage:read` e `storage:write` a **todo usuário autenticado**, inclusive o colaborador com login no app.
- `StorageService.listByEntity(entityType, entityId)` e `download(objectId)` checam **apenas** `storage:read`. Não verificam se o usuário tem permissão sobre a entidade dona do arquivo.

**Consequência:** qualquer usuário autenticado que obtenha o ID de uma entidade ou de um arquivo lista e baixa os anexos dela. Isso inclui atestado médico (afastamento), currículo (candidato) e documentos de admissão. Os IDs são UUID, difíceis de adivinhar, mas circulam em outras respostas da API. É uma falha do tipo IDOR (acesso direto por referência).

A mitigação existente é parcial. `StorageObject` e `StorageObjectLink` são escopados por filial, então **com** o header o acesso fica restrito à filial. Ainda assim, ninguém confere se o usuário pode ver a entidade dona do arquivo. As selfies do ponto também são objetos de storage e ficam expostas pelo mesmo caminho.

**Agravante (confirmado por leitura):** `BranchContextHolder.isUnscoped()` devolve verdadeiro quando o request **não traz** `X-Branch-Id`, e então o `BranchScopeAspect` **desliga** o filtro de filial. Sem o header, o usuário cai nas authorities "sem filial" (as pessoais, que incluem `storage:read`) e as consultas deixam de ser filtradas por filial. Um usuário restrito à filial A que omita o header pode enxergar anexos de todas as filiais.

**Correção proposta:**

1. **A permissão do anexo passa a vir da entidade dona.** Um registro `entityType → authority exigida` (`leave → leave:read`; campos clínicos → `leave:sensitive`; `candidate → candidate:read`) é checado dentro do `StorageService`.
2. **Sem filial selecionada, a consulta falha.** Em repositório de entidade escopada por filial, contexto sem filial é negado. Só `@BranchUnscoped` explícito atravessa filiais.
3. **Teste de regressão:** usuário A tenta baixar o anexo de um afastamento sem ter `leave:read` e deve receber 403.

### SEG-02: CID exposto no afastamento (severidade alta, LGPD-01 do Raio-X)

**Leitura do código:** `LeaveRequestResponseDto.cid` é montado incondicionalmente. Quem tem `leave:read` vê o diagnóstico.

**Correção:** aplicar o mesmo padrão de Exames. Criar a authority `leave:sensitive`, que ao mesmo tempo **mascara na leitura** e **descarta na gravação** o CID e as observações médicas. Rever também se o CID precisa ser guardado: para abono ou afastamento previdenciário, basta o tipo e o período.

### SEG-03: Qualquer colaborador com login vê CPF e foto de todos (severidade alta)

**Leitura do código:** `LeaveRequestService.findVacationEligibleCollaborators` (linha 185) aceita `leave:read` **ou** `notification:read`. Todo usuário ligado a colaborador recebe `notification:read` (`BranchAccessResolver`, linhas 51 e 78). A resposta traz nome, CPF, data de admissão e `photoObjectId`. Sem o header de filial, a lista cobre todas as filiais. Somado ao SEG-01, a foto também pode ser baixada.

**Correção:** retirar `notification:read` dessa checagem. Se a notificação precisar de dados do colaborador, usar um DTO mínimo (nome e ID), sem CPF nem foto.

### SEG-04: A candidatura pública sobrescreve dados de candidato existente pelo CPF (severidade alta)

**Leitura do código:** `PublicCareersService.apply` busca o candidato pelo CPF (linhas 110-111), **sobrescreve** nome, e-mail, telefone e data de nascimento (linhas 118-126) e **substitui** as experiências (`replaceAll`, linha 140). Quem souber o CPF de alguém altera o cadastro dessa pessoa sem autenticação. Campos não enviados, como a data de nascimento (que a página não pede), são **gravados como nulos** por cima dos existentes: perda de dado. O erro `alreadyApplied` ainda revela se aquele CPF se candidatou à vaga.

**Correção:** candidatura pública **nunca sobrescreve** dados existentes. Ou cria uma nova versão pendente de confirmação por e-mail (link mágico, D8), ou guarda os dados só na candidatura. Mensagem de erro neutra.

### SEG-05: Ponto público sem limite de tentativas (severidade média)

**Leitura do código:** `/api/v1/public/ponto/clock` aceita o código do colaborador (9 dígitos com dígito verificador) e uma foto. Não há limite de tentativas, e a resposta devolve o nome do colaborador (`PublicPontoService`, linhas 66-69 e 103-114). Dá para descobrir códigos válidos e registrar ponto falso.

**Correção:** limite de tentativas por IP e por código, resposta sem o nome completo e, se possível, vínculo com dispositivo ou geolocalização (com base legal declarada, LGPD-02).

### Observações de menor severidade

- **GLOBAL_ADMIN** ignora abrangência e controle de contrato por sistema. É por desenho, mas deve constar na matriz e ser concedido a poucas pessoas.
- **Mudança de perfil** só vale na próxima renovação do token (8 minutos). É aceitável, mas precisa ser documentado.
- **`/api/v1/internal/**`** é público e depende de um segredo compartilhado; sem o segredo configurado, recusa. Fica registrado como superfície exposta.
- **Frontend:** o `X-Branch-Id` só é enviado quando há filial ativa no navegador; chamadas feitas no servidor (SSR) vão sem ele. Isso reforça a D6 (negar sem filial).

---

## 4. Decisões propostas

| # | Decisão | Justificativa |
|---|---|---|
| **D1** | **Manter** a base atual: authority `modulo:acao` + filial + perfil por filial | Funciona, tem teste e segue o padrão do projeto. Reescrever custaria semanas sem ganho. |
| **D2** | **Adicionar o eixo "abrangência" ao vínculo usuário–perfil**: `user_role.data_scope ∈ {ALL, DEPARTMENT, TEAM, ASSIGNED, SELF}`, com `scope_ref` (departamento ou vaga) | Resolve o gestor que só vê a própria equipe, o recrutador que só vê as próprias vagas e o colaborador que só vê os próprios dados, sem criar perfis duplicados. |
| **D3** | **Implementar a abrangência como filtro do Hibernate**, no mesmo padrão do filtro de filial, e só nas entidades que precisam (colaborador, candidatura, afastamento, desempenho, PDI) | Reaproveita o mecanismo que já existe e tem teste. O padrão atual serve de guia, então não cria padrão novo. |
| **D4** | **Classificação de campo por authority `modulo:sensitive`**, generalizando `occupationalexam:clinical` para um componente central de mascaramento na montagem da resposta e descarte na gravação | O padrão já existe e foi validado em Exames. Centralizar evita que cada módulo esqueça. |
| **D5** | **Anexos herdam a permissão da entidade dona** (SEG-01) | Anexo é o maior repositório de dado sensível do sistema. |
| **D6** | **Negar por padrão sem filial** (SEG-01) | Hoje a ausência de header amplia o acesso. Deve restringir. |
| **D7** | **Ativar `audit_log`** para (a) leitura de campo `sensitive`, (b) decisões sobre pessoas (reprovar, aprovar, desligar, efetivar) com motivo, (c) mudanças de perfil e permissão | Base para a RN-05, para o direito de revisão do art. 20 da LGPD e para a defesa trabalhista. |
| **D8** | **Identidade do candidato como papel externo sem senha**: link mágico ou código, sessão própria, portal com "minhas candidaturas", consentimentos e retirada | Hoje a candidatura é anônima e não dá para exercer os direitos do titular. |

---

## 5. Matriz de permissões (papéis-padrão sugeridos)

Legenda: **L** ler · **E** escrever · **A** aprovar/decidir · **S** ver campos sensíveis · — sem acesso
Abrangência: **T** todas as filiais do vínculo · **F** filial · **D** departamento · **Eq** equipe direta · **At** registros atribuídos · **P** próprio

| Papel | Colaborador / Admissão | Afastamento | Exames (clínico) | Vaga | Candidatura / Candidato | Desempenho / PDI | Desligamento | Folha / Pagamentos | Perfis / Usuários |
|---|---|---|---|---|---|---|---|---|---|
| **Admin global** | L E A S · T | L E A S · T | L E S · T | L E A · T | L E A · T | L E A · T | L E A · T | L E · T | L E · T |
| **Analista DP** | L E · F | L E · F | L · F | — | L · F *(pré-admissão)* | — | L E · F | L E · F | — |
| **Analista RH / BP** | L E · F | L · F | — | L E · F | L E A · F | L E A · F | L · F | — | — |
| **Recrutador** | — | — | — | L E · At | L E A · At | — | — | — | — |
| **Gestor requisitante** | L · Eq | L · Eq *(sem S)* | — | L · At *(abre requisição)* | L A · At *(só as próprias vagas)* | L E A · Eq | L · Eq | — | — |
| **Entrevistador** | — | — | — | L · At | L · At *(sem salário pretendido)* + E *(scorecard)* | — | — | — | — |
| **SESMT / Médico do trabalho** | L · F | L S · F | L E S · F | — | — | — | L · F *(demissional)* | — | — |
| **Contador (externo)** | L · T | L · T *(sem S)* | — | — | — | — | L · T | L E · T | — |
| **Colaborador (autoatendimento)** | L · P | L E · P *(envia atestado)* | L · P *(próprio ASO)* | — | — | L · P | — | L · P *(holerite)* | — |
| **Auditor** | L · T *(só trilha de auditoria)* | — | — | — | — | — | — | — | L · T *(configuração, sem editar)* |
| **Candidato (externo)** | — | — | — | L *(vagas públicas)* | L E · P *(dados, retirada, consentimento)* | — | — | — | — |

**Regras transversais da matriz:**

- **S nunca vem junto com escrita em massa nem com exportação.** Exportar campo sensível exige authority própria (`modulo:export`) e gera log.
- **A (decisão sobre pessoa) sempre gera registro na RN-05**, com autor e motivo.
- **O candidato só enxerga dados sensíveis dele mesmo e só a partir da pré-admissão** (RN-02).
- **A nota de IA (`ai_score`) é L para quem vê a candidatura, mas nunca muda o status sozinha.** Pela leitura do código, isso já é verdade hoje: `ApplicationAiAnalysisService` não altera o status.

---

## 6. Implicações para o R&S encontradas no código

O R&S **não é terreno vazio**. Já existem: `JobVacancy`, `Candidate`, `CandidateExperience`, `JobVacancyApplication` (kanban, comentários por etapa, origem, pretensão salarial), página pública de carreiras com upload de CV e análise de currículo por IA (Gemini, com rubrica). Isso muda a camada 3 do plano: de **construir** para **adequar**.

| Situação atual | Conflito com a ordem de regras | Ajuste |
|---|---|---|
| `Candidate` é escopado **por filial** | RN-00: a Pessoa é única no tenant. A rota pública busca o CPF em todas as filiais e mantém a filial original do candidato, enquanto a candidatura fica com a filial da vaga. Resultado: **o recrutador da filial B vê a candidatura mas não o candidato cadastrado na filial A** *(confirmado por leitura)* | Candidato como Pessoa do tenant, candidatura por filial |
| CPF **obrigatório** e **data de nascimento** coletados na candidatura | RN-02: dado mínimo. Idade na triagem é risco de discriminação (Lei 9.029/95) | CPF opcional ou só na pré-admissão; data de nascimento só na admissão |
| Nenhum consentimento registrado na candidatura | RN-02 / RN-33b | Consentimentos separados (processo e banco de talentos) com data e versão do termo |
| CV enviado a LLM externo (Gemini/OpenAI) | LGPD: transferência internacional e transparência | Informar na candidatura; avaliar anonimizar nome, CPF e contato antes de enviar |
| `department` como texto livre, salário e senioridade na vaga | RN-11/RN-12 | Vaga referencia Cargo + nível; faixa vem da estrutura salarial |
| Status fixo (`APPLIED…REJECTED`), sem motivo de reprovação | RN-34 / RN-05 | Reprovação exige motivo padronizado + autor |
| **Existe conversão mínima**: botão "Criar Admissão" na coluna `hiring` do kanban (`create-admission-from-kanban-card.ts`), feita no frontend em três chamadas. Copia nome, CPF, e-mail, telefone, data de nascimento e cargo. **Fixa o tipo de contrato como CLT e a data de início como hoje.** Não liga a admissão de volta à candidatura, não marca a candidatura como contratada nem encerra as demais. **Exige data de nascimento, mas a página pública não pede esse dado e o backend grava nulo por cima do cadastro: candidato vindo da página nunca é convertível** | RN-38, RN-13, RN-02 | Levar a conversão para o backend, numa só transação. Ligar candidatura e admissão nos dois sentidos. Tipo de vínculo e data de início vêm da proposta (RN-37). Data de nascimento e dados sensíveis são coletados **na pré-admissão pelo próprio candidato**, e não na candidatura |
| Vaga sem responsável | Matriz (abrangência "At") | Adicionar recrutador e gestor responsáveis |

---

## 7. Divergência estratégica a alinhar com o Flávio

O `docs/analise/plano-execucao-sprints.md` (última alteração no git em 26 ago 2026) prevê **Sprint 0 + 15 sprints (~8 meses)**. O peso maior está no **motor de folha calculada**: parametrização tributária, proporcional, benefícios na folha, 13º e rescisão com verbas nas fases A e B, além de partes da C. Há também uma fase de ciclo de vida (afastamentos, férias, rescisão), e a **Sprint 1 é trilha de auditoria**, o que coincide com a D7 deste documento. O código já calcula INSS, IRRF e FGTS (`ctb/payroll/calculation/strategy/`).

O R&S **não aparece** no plano de sprints.

Isso contradiz duas premissas usadas até aqui:

1. O Raio-X assumiu que o Gesint **não calcula folha** e se posiciona para empresas que terceirizam a contabilidade.
2. A reunião de sexta decidiu **priorizar o R&S / ciclo de vida**.

**Folha calculada é outro produto**: compete com Domínio e TOTVS, traz risco fiscal e exige manutenção legal contínua. Não dá para seguir com as duas prioridades ao mesmo tempo com um time pequeno. **É preciso uma decisão explícita:** congelar a folha no estado atual e usar o módulo CTB como exportação ao contador, ou assumir a folha e adiar o R&S.

**Minha recomendação:** congelar a folha e seguir com a decisão de sexta. É coerente com o comprador (PME que terceiriza a folha) e com o canal do contador.

---

## 8. Plano de execução da RN-03

| Ordem | Entrega | Tipo | Esforço estimado* |
|---|---|---|---|
| 1 | SEG-01: anexo herda permissão da entidade + negar sem filial + teste | Correção | 2–4 dias |
| 2 | SEG-02: `leave:sensitive` (mascarar e descartar CID) + teste | Correção | 1–2 dias |
| 2b | SEG-03: retirar `notification:read` da lista de elegíveis + DTO mínimo | Correção | < 1 dia |
| 2c | SEG-04: candidatura pública não sobrescreve cadastro + mensagem neutra | Correção | 1–2 dias |
| 2d | SEG-05: limite de tentativas no ponto público | Correção | 1 dia |
| 3 | D4: componente central de campo sensível (generaliza o padrão de Exames) | Evolução | 3–5 dias |
| 4 | D7: `audit_log` ativo (leitura sensível, decisões, mudanças de perfil) | Evolução | 3–5 dias |
| 5 | D2/D3: abrangência no vínculo (`data_scope`) + filtros para colaborador e candidatura | Evolução | 1–2 semanas |
| 6 | Matriz de testes de autorização por papel (seção 5) | Qualidade | 3–5 dias, em paralelo |
| 7 | D8: identidade do candidato (link mágico + portal) | Nova | 1 semana, junto com a camada 3 |

\* Estimativa por leitura de código, para um desenvolvedor que conhece a base. Quem valida é o Flávio.

**Ponto de controle G0 (revisado):** SEG-01 e SEG-02 corrigidos com teste, `audit_log` gravando, `data_scope` funcionando para o Gestor (equipe) e o Recrutador (vagas atribuídas).

---

## 9. Limites desta análise

- Leitura de código, **auditada de forma independente**, sem executar a aplicação nem a suíte de testes. Cada SEG tem um teste de reprodução proposto, e é ele que fecha a confirmação.
- Frontend inspecionado: o `X-Branch-Id` só é enviado com filial ativa no navegador. O cenário do agravante vale para chamadas diretas à API e para SSR.
- O banco de produção e os tenants não foram acessados.
- Os documentos em `docs/analise/` são de junho a setembro. Parte do diagnóstico de junho (por exemplo, "não existe filial") já foi superada pela V89.
