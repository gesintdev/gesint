# Instrucoes para agentes (rascunhos)

Pasta para escrever e organizar regras do projeto antes de ativa-las para agentes de IA.

## Como usar

1. Edite ou duplique `template-regras.mdc` com o nome da sua regra.
2. Preencha o frontmatter (`description`, `globs`, `alwaysApply`) e o conteudo em markdown.
3. Quando estiver pronta, ative de um destes jeitos:
   - Copie o arquivo para `.agents/rules/` (ex.: `.agents/rules/minha-regra.mdc`), ou
   - Mova o arquivo de `.agents/instrucoes/` para `.agents/rules/`.

A pasta `.agents/rules/` e a fonte canonica das regras compartilhadas entre agentes. Ferramentas especificas, como Cursor, devem ser orientadas a ler este caminho.

## Regras ja ativas no projeto

| Arquivo | Escopo |
|---------|--------|
| `.agents/rules/gommo.mdc` | Padroes gerais do monolito |
| `.agents/rules/gommo-frontend-ui.mdc` | Convencoes tecnicas do frontend |
| `.agents/rules/gommo-ui-system.mdc` | Design system Stripe/Linear (UI) |
| `.agents/rules/gommo-payroll-module.mdc` | Folha de Pagamento (CTB) |

Edite `gommo-ui-system.mdc` nesta pasta e sincronize com `.agents/rules/gommo-ui-system.mdc` quando alterar.

## Campos do frontmatter

- `alwaysApply: true` - aplica em toda conversa.
- `globs: gommo-frontend/**/*.tsx` - aplica so ao abrir arquivos que batem o padrao.
- `description` - texto curto exibido no seletor/listagem de regras do agente.