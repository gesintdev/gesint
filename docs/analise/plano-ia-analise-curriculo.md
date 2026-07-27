# Análise de currículo por IA no Gommo

> **Status:** adiado — guardar para execução futura  
> **Data:** 2026-07-27  
> **Origem:** plano Cursor `ia_análise_currículo`

## Overview

Arquitetura para análise/rankeamento de currículos: pipeline híbrido (extração + rubrica determinística) via API LLM barata, como módulo no monólito com job assíncrono — sem microserviço no MVP.

## Contexto atual (já existe)

- Entidades: `Candidate`, `JobVacancy`, `JobVacancyApplication`, `CandidateExperience`
- CV: `storage_object` + link `entityType=candidate`, `linkRole=CURRICULUM`
- Candidatura pública: `PublicCareersService` + upload de resume
- UI: kanban de vagas, `CandidateAnalysisModal` (hoje só perfil, sem score)
- **Não existe** score/ranking ainda

## O que grandes ATS fazem (Greenhouse, Lever, Recruitee)

Não pedem ao LLM "dê uma nota de 0 a 100" e pronto. O padrão efetivo é:

1. **Extrair** texto do PDF/DOCX
2. **Estruturar** (experiências, skills, formação, idiomas) via LLM ou parser
3. **Pontuar com rubrica** contra a vaga (requisitos, senioridade, stack) — regras + pesos, às vezes com LLM só no match semântico
4. **Explicar** (matched / missing / risks) para o RH confiar
5. **Rodar assíncrono** — candidatura salva na hora; score chega depois

```mermaid
flowchart LR
  Apply["Candidatura + CV"] --> Queue["Job async"]
  Queue --> Extract["Extrair texto PDF"]
  Extract --> Parse["LLM estrutura JSON"]
  Parse --> Score["Rubrica vs JobVacancy"]
  Score --> Persist["ai_score + summary JSON"]
  Persist --> UI["Kanban + AnalysisModal"]
```

## Decisão fechada para o Gommo

### Arquitetura: módulo no monólito, não microserviço no MVP

Motivo: volume de candidaturas de um ERP RH é baixo; o custo/ops de um serviço separado (deploy, auth, fila, observabilidade) não se paga agora. O monólito já está preparado para separação futura.

Colocar em algo como:

```text
br.com.gommo.modules.rh.person.recruiting.ai
  ResumeTextExtractor
  ResumeParseService      // chama LLM → JSON estruturado
  VacancyFitScoringService // rubrica determinística
  ApplicationAiAnalysisJob // @Async / fila
```

Extrair para microserviço só se: multi-tenant com milhares de CVs/dia, necessidade de GPU própria, ou time separado dono do modelo.

### Motor: híbrido (LLM + rubrica)

| Etapa | Como | Por quê |
|---|---|---|
| Extração de texto | Apache Tika / PDFBox no Java | Barato, estável, sem IA |
| Parse estruturado | LLM com JSON schema (skills, anos, cargos, formação) | Flexível com CVs bagunçados em PT-BR |
| Score 0–100 | Rubrica no código vs `requirements` / `seniorityLevel` / `jobTitle` da vaga | Explicável, barato, estável (mesmo CV → mesma nota) |
| Resumo / justificativa | LLM curto ou templates a partir do match | UI no modal |

Não confiar só no "score do ChatGPT" — varia entre runs e é difícil auditar.

### Modelo recomendado (MVP → produção)

| Fase | Modelo | Uso |
|---|---|---|
| Dev / piloto | Gemini 2.0 Flash (free tier) ou Groq (Llama) | Validar prompt e UX com custo ~zero |
| Produção | GPT-4o-mini ou Gemini Flash | Melhor custo/qualidade em PT-BR e JSON estável |
| Evitar no início | GPT-4o / Claude Opus / fine-tune próprio | Caro demais para parse de CV |
| Self-host (Ollama) | Só se compliance exigir "dado não sai" | Ops + qualidade inferior; não é "grátis" de verdade |

Provedor atrás de uma interface `LlmClient` (Strategy) — trocar modelo sem reescrever o domínio.

### Dá para fazer grátis?

- **Protótipo sim**: Gemini free tier / Groq free — ótimo para validar.
- **Produção séria não**: free tier tem rate limit, sem SLA, e CV contém PII (LGPD). Preferir API paga com contrato + retenção zero quando possível.
- Custo realista MVP (ordem de grandeza):
  - ~2–5k tokens por CV (extração já no Java; LLM só no JSON + resumo curto)
  - GPT-4o-mini ≈ **US$ 0.01–0.03 por currículo**
  - 1.000 candidaturas/mês ≈ **US$ 10–30** (irrisório vs valor de RH)

### Contrato de saída (persistir na candidatura)

Campos novos em `job_vacancy_application` (Flyway):

- `ai_score` (0–100, nullable)
- `ai_status` (`PENDING | READY | FAILED`)
- `ai_analyzed_at`
- `ai_analysis` JSONB, ex.:

```json
{
  "matchedSkills": ["Java", "Spring"],
  "missingSkills": ["Kubernetes"],
  "experienceYears": 4,
  "seniorityGuess": "PLENO",
  "summary": "Perfil alinhado em backend; falta cloud.",
  "risks": ["Gap de 18 meses"],
  "model": "gpt-4o-mini",
  "rubricVersion": "v1"
}
```

### Gatilhos

1. Após apply público / upload de CV → enfileira análise
2. Botão "Reanalisar" no `CandidateAnalysisModal`
3. Ordenação do kanban / lista por `ai_score`

### LGPD (obrigatório no desenho)

- Não logar texto completo do CV
- Prompt só com trechos necessários + requisitos da vaga
- Preferir provedores com zero data retention
- Guardar `model` + `rubricVersion` para auditoria
- Score é **apoio**, não decisão automática de rejeição (evitar viés jurídico)

## O que não fazer

- Microserviço "AI" desde o dia 1
- Embeddings + vector DB no MVP (overkill até ter busca semântica em milhares de CVs)
- Score 100% LLM sem rubrica
- Análise síncrona no request de candidatura (timeout ruim)

## Fases de entrega

1. **Spike (1–2 dias)**: Tika + 1 prompt JSON + score mock na vaga; validar qualidade em 10 CVs reais
2. **MVP**: job async, campos na application, UI score no modal + sort no kanban
3. **Evolução**: pesos configuráveis por vaga, reparse de experiências para `candidate_experience`, embeddings se volume crescer
4. **Split**: só então extrair `gommo-ai` se throughput/compliance exigir

## Todos (quando executar)

- [ ] Spike: Tika + LLM JSON schema em 10 CVs reais vs 1 vaga
- [ ] Flyway `ai_score` / `ai_status` / `ai_analysis` em `job_vacancy_application`
- [ ] Job async no apply + botão reanalisar
- [ ] Score no `CandidateAnalysisModal` + ordenação no kanban

## Próximo passo (quando for implementar)

Spike técnico no monólito: extrair texto de um `CURRICULUM` existente + chamar Gemini/OpenAI com schema fixo + gravar `ai_score` de teste em uma candidatura — sem UI completa ainda.
