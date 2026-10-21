"use client";

import { create } from "zustand";

/** Sub-aba CRUD: Vaga - [nome]. */
export const JOB_VACANCY_OVERVIEW_TAB_ID = "vacancy-overview";

export type JobVacancyInnerPanel = "detail" | "candidates";

/** @deprecated Use JOB_VACANCY_OVERVIEW_TAB_ID + inner panel "detail" */
export const JOB_VACANCY_DETAIL_TAB_ID = JOB_VACANCY_OVERVIEW_TAB_ID;
/** @deprecated Use inner panel "candidates" */
export const JOB_VACANCY_CANDIDATES_TAB_ID = "candidates";
/** @deprecated Use JOB_VACANCY_OVERVIEW_TAB_ID */
export const JOB_VACANCY_ADMISSION_PROCESS_TAB_ID = JOB_VACANCY_OVERVIEW_TAB_ID;

type JobVacancyWorkspaceInput = {
    jobVacancyId: string;
    jobVacancyTitle?: string | null;
};

type JobVacancyWorkspaceState = {
    jobVacancyId: string | null;
    jobVacancyTitle: string | null;
    innerPanel: JobVacancyInnerPanel;
    pendingFocus: boolean;
    /** Vincula a vaga sem navegar (ex.: ao abrir o cadastro). */
    select: (input: JobVacancyWorkspaceInput) => void;
    /** Abre a sub-aba da vaga no painel Detalhamento. */
    openDetail: (input: JobVacancyWorkspaceInput) => void;
    /** Abre a sub-aba da vaga no painel Candidatos. */
    openCandidates: (input: JobVacancyWorkspaceInput) => void;
    setInnerPanel: (panel: JobVacancyInnerPanel) => void;
    clearPendingFocus: () => void;
    clear: () => void;
};

function toVacancyState(input: JobVacancyWorkspaceInput) {
    return {
        jobVacancyId: input.jobVacancyId?.trim() || null,
        jobVacancyTitle: input.jobVacancyTitle?.trim() || null,
    };
}

export const useJobVacancyAdmissionProcessStore = create<JobVacancyWorkspaceState>((set) => ({
    jobVacancyId: null,
    jobVacancyTitle: null,
    innerPanel: "detail",
    pendingFocus: false,
    select: (input) =>
        set({
            ...toVacancyState(input),
            pendingFocus: false,
        }),
    openDetail: (input) =>
        set({
            ...toVacancyState(input),
            innerPanel: "detail",
            pendingFocus: true,
        }),
    openCandidates: (input) =>
        set({
            ...toVacancyState(input),
            innerPanel: "candidates",
            pendingFocus: true,
        }),
    setInnerPanel: (panel) => set({ innerPanel: panel }),
    clearPendingFocus: () => set({ pendingFocus: false }),
    clear: () =>
        set({
            jobVacancyId: null,
            jobVacancyTitle: null,
            innerPanel: "detail",
            pendingFocus: false,
        }),
}));
