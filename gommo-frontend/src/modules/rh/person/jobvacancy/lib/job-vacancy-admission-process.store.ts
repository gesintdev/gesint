"use client";

import { create } from "zustand";

export const JOB_VACANCY_ADMISSION_PROCESS_TAB_ID = "admission-process";

type JobVacancyAdmissionProcessState = {
    jobVacancyId: string | null;
    jobVacancyTitle: string | null;
    pendingFocus: boolean;
    start: (input: { jobVacancyId: string; jobVacancyTitle?: string | null }) => void;
    clearPendingFocus: () => void;
    clear: () => void;
};

export const useJobVacancyAdmissionProcessStore = create<JobVacancyAdmissionProcessState>((set) => ({
    jobVacancyId: null,
    jobVacancyTitle: null,
    pendingFocus: false,
    start: (input) =>
        set({
            jobVacancyId: input.jobVacancyId?.trim() || null,
            jobVacancyTitle: input.jobVacancyTitle?.trim() || null,
            pendingFocus: true,
        }),
    clearPendingFocus: () => set({ pendingFocus: false }),
    clear: () => set({ jobVacancyId: null, jobVacancyTitle: null, pendingFocus: false }),
}));
