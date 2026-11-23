<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Padrão de layout (obrigatório)

Antes de alterar qualquer tela, componente ou CSS deste app, leia:

- `../.agents/rules/gesint.mdc` — regras gerais do projeto
- `../.agents/rules/gesint-frontend-ui.mdc` — convenções do frontend
- `../.agents/rules/gesint-ui-system.mdc` — **padrão visual completo** (fonte de verdade de layout)

Resumo do que não pode ser quebrado (detalhes no `gesint-ui-system.mdc`):

- Estilos por token e classe semântica em `src/app/globals.css`; nada de hex em `.tsx`.
- Escala fixa do ClickUp (`gesint-ui-system.mdc` §13.1): fonte `"Segoe UI Variable Text"` (via `@font-face local()`), controles 28px, texto do input 13px, label 11px/400, subabas 32px, toolbar da listagem e do cadastro com botões 30px, linha de tabela 36px. Sem `zoom`/`transform: scale`.
- Peso de fonte via `font-weight` (400 texto · 450 botão/destaque · 550 título/aba ativa); nunca `font-variation-settings: "wght"`. `body` com `line-height: 1.5`.
- Raios: badge 4px · aba 4px · botão/input 5px · card 6px · modal 8px.
- Rail de sistemas mais escuro que a sidebar (claro e escuro).
- Botão primário sólido, sem gradiente/glow. Item ativo da sidebar: fundo `primary 8%` + barra de 3px à esquerda.
- Carregamento: `AppLoadingScreen` (tela/Suspense) ou skeleton (conteúdo). Nunca "Carregando..." solto.
- Menu da conta na topbar (`HeaderUserMenu`), não na sidebar.
- Login: `LoginShell` só em `src/app/(auth)/layout.tsx`; páginas de `(auth)` renderizam `LoginHeading` + formulário. Campos e botão 36px.
- Animações: Framer Motion com `MotionConfig reducedMotion="user"`, curva `[0.22, 1, 0.36, 1]`; nada de `transform` em container com filhos `position: fixed`.
- Só dados reais em tela; conferir sempre nos temas claro e escuro rodando o app.
