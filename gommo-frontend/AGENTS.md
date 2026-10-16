<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Padrão de layout (obrigatório)

Antes de alterar qualquer tela, componente ou CSS deste app, leia:

- `../.agents/rules/gommo.mdc` — regras gerais do projeto
- `../.agents/rules/gommo-frontend-ui.mdc` — convenções do frontend
- `../.agents/rules/gommo-ui-system.mdc` — **padrão visual completo** (fonte de verdade de layout)

Resumo do que não pode ser quebrado (detalhes no `gommo-ui-system.mdc`):

- Estilos por token e classe semântica em `src/app/globals.css`; nada de hex em `.tsx`.
- Peso de fonte via `font-weight`; nunca `font-variation-settings: "wght"` em `body`/containers. `body` com `line-height: 1.5`.
- Raios: badge 5px · aba 6px · botão/input 7px · card 8px · modal 12px.
- Rail de sistemas mais escuro que a sidebar (claro e escuro).
- Botão primário sólido, sem gradiente/glow. Item ativo da sidebar: fundo `primary 8%` + barra de 3px à esquerda.
- Carregamento: `AppLoadingScreen` (tela/Suspense) ou skeleton (conteúdo). Nunca "Carregando..." solto.
- Login: `LoginShell` só em `src/app/(auth)/layout.tsx`; páginas de `(auth)` renderizam `LoginHeading` + formulário.
- Animações: Framer Motion com `MotionConfig reducedMotion="user"`, curva `[0.22, 1, 0.36, 1]`; nada de `transform` em container com filhos `position: fixed`.
- Só dados reais em tela; conferir sempre nos temas claro e escuro rodando o app.
