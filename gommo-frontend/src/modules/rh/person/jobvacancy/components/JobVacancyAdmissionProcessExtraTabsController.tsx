"use client";

import { Suspense, useEffect, useMemo } from "react";

import { JobVacancyAdmissionProcessTab } from "@/modules/rh/person/jobvacancy/components/JobVacancyAdmissionProcessTab";
import {
    JOB_VACANCY_ADMISSION_PROCESS_TAB_ID,
    useJobVacancyAdmissionProcessStore,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import {
    type CrudExtraTab,
    useCrudExtraTabs,
    useCrudScreen,
} from "@/shared/components/crud/CrudScreen";

/** Aba fixa de processo: desabilitada ate haver vaga selecionada. */
export function JobVacancyAdmissionProcessExtraTabsController() {
    const { activeTab, goToTab } = useCrudScreen();
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const jobVacancyTitle = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyTitle);
    const pendingFocus = useJobVacancyAdmissionProcessStore((state) => state.pendingFocus);
    const clearPendingFocus = useJobVacancyAdmissionProcessStore((state) => state.clearPendingFocus);

    const extraTabs = useMemo((): CrudExtraTab[] => {
        const hasVacancy = Boolean(jobVacancyId);
        return [
            {
                id: JOB_VACANCY_ADMISSION_PROCESS_TAB_ID,
                label:
                    hasVacancy && jobVacancyTitle
                        ? `Processo De Admissão · ${jobVacancyTitle}`
                        : "Processo De Admissão",
                permission: "admission:read",
                disabled: !hasVacancy,
                content: (
                    <Suspense fallback={null}>
                        <JobVacancyAdmissionProcessTab />
                    </Suspense>
                ),
            },
        ];
    }, [jobVacancyId, jobVacancyTitle]);

    useCrudExtraTabs(extraTabs);

    useEffect(() => {
        if (!pendingFocus || !jobVacancyId) return;
        const tab = extraTabs.find((item) => item.id === JOB_VACANCY_ADMISSION_PROCESS_TAB_ID);
        if (!tab || tab.disabled) return;
        goToTab(JOB_VACANCY_ADMISSION_PROCESS_TAB_ID);
    }, [extraTabs, goToTab, jobVacancyId, pendingFocus]);

    useEffect(() => {
        if (!pendingFocus) return;
        if (activeTab !== JOB_VACANCY_ADMISSION_PROCESS_TAB_ID) return;
        clearPendingFocus();
    }, [activeTab, clearPendingFocus, pendingFocus]);

    return null;
}
