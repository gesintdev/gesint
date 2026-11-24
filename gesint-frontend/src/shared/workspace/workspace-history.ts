"use client";

import { createContext, useContext } from "react";

/** URL de tela já aceita pelo workspace (navegação ou voltar/avançar do navegador). */
export type WorkspaceHistoryCommit = {
    key: string;
    epoch: number;
};

const WorkspaceHistoryCommitContext = createContext<WorkspaceHistoryCommit | null>(null);

export const WorkspaceHistoryCommitProvider = WorkspaceHistoryCommitContext.Provider;

export function useWorkspaceHistoryCommit(): WorkspaceHistoryCommit | null {
    return useContext(WorkspaceHistoryCommitContext);
}
