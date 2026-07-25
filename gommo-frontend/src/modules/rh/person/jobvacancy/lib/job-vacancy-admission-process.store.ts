"use client";

import { create } from "zustand";

export const JOB_VACANCY_ADMISSION_PROCESS_TAB_ID = "admission-process";

type JobVacancyAdmissionProcessInput = {
    jobVacancyId: string;
    jobVacancyTitle?: string | null;
};

type JobVacancyAdmissionProcessState = {
    jobVacancyId: string | null;
    jobVacancyTitle: string | null;
    pendingFocus: boolean;
    /** Vincula a vaga à aba sem navegar para ela (ex.: ao abrir o cadastro). */
    select: (input: JobVacancyAdmissionProcessInput) => void;
    /** Vincula a vaga e foca a aba de processo. */
    start: (input: JobVacancyAdmissionProcessInput) => void;
    clearPendingFocus: () => void;
    clear: () => void;
};

function toVacancyState(input: JobVacancyAdmissionProcessInput) {
    return {
        jobVacancyId: input.jobVacancyId?.trim() || null,
        jobVacancyTitle: input.jobVacancyTitle?.trim() || null,
    };
}

export const useJobVacancyAdmissionProcessStore = create<JobVacancyAdmissionProcessState>((set) => ({
    jobVacancyId: null,
    jobVacancyTitle: null,
    pendingFocus: false,
    select: (input) =>
        set({
            ...toVacancyState(input),
            pendingFocus: false,
        }),
    start: (input) =>
        set({
            ...toVacancyState(input),
            pendingFocus: true,
        }),
    clearPendingFocus: () => set({ pendingFocus: false }),
    clear: () => set({ jobVacancyId: null, jobVacancyTitle: null, pendingFocus: false }),
}));
