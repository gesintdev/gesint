# Instruções do projeto

Leia obrigatoriamente:

- `.agents/rules/gesint.mdc` — arquitetura, Admin/Client, backend, tenant e **site institucional** (app separado; `www` e o apex não entram no ERP)
- `.agents/rules/gesint-frontend-ui.mdc` — dados, filial e workspace do Client
- `.agents/rules/gesint-ui-system.mdc` — layout e componentes visuais do Client
- `.agents/rules/gesint-payroll-module.mdc` quando tocar folha/payroll
- O documento do módulo em `docs/modulos/` quando a alteração mudar regra de negócio

O mapa completo e a regra do site estão no início de `.agents/rules/gesint.mdc`. Não criar o site dentro de `gesint-frontend`.

Antes de implementar qualquer alteração:

1. Analise a arquitetura existente
2. Procure implementação semelhante
3. Explique o plano
4. Só então implemente

Mudanças visuais no frontend (telas, componentes, CSS) seguem fielmente o padrão de layout descrito em
`.agents/rules/gesint-ui-system.mdc` e precisam ser conferidas rodando o app, nos temas claro e escuro.

Regra máxima:

Sempre seguir os padrões existentes do projeto.
Nunca criar novos padrões sem justificativa explícita.
Tudo que for usado mais de uma vez vira componente dedicado. Modal de conteúdo é `Modal`.
