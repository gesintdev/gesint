import type { ComponentType } from "react";

/** Import dinâmico da tela — não executa até o workspace abrir a aba. */
export type WorkspacePageLoader = () => Promise<{ default: ComponentType }>;

/** Tela do workspace associada a um `href` de rota (App Router + abas). */
export type WorkspacePageEntry = {
    href: string;
    Component: ComponentType;
};
