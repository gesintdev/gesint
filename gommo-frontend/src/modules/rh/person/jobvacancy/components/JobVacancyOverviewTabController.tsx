"use client";

import { useEffect, useLayoutEffect } from "react";

import {
    JOB_VACANCY_OVERVIEW_TAB_ID,
    useJobVacancyAdmissionProcessStore,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { CRUD_TAB_FORM, useCrudScreen } from "@/shared/components/crud/CrudScreen";

/**
 * Foca a sub-aba Vaga apos openDetail.
 * Limpa o vinculo apenas ao iniciar cadastro novo (Novo / Novo cadastro).
 * Trocar para Listagem mantem a aba Vaga; o destroy da aba principal do workspace ja limpa o estado.
 */
export function JobVacancyOverviewTabController() {
    const { activeTab, goToTab, isEditing } = useCrudScreen();
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const pendingFocus = useJobVacancyAdmissionProcessStore((state) => state.pendingFocus);
    const clearPendingFocus = useJobVacancyAdmissionProcessStore((state) => state.clearPendingFocus);
    const clear = useJobVacancyAdmissionProcessStore((state) => state.clear);

    useLayoutEffect(() => {
        if (!pendingFocus || !jobVacancyId) return;
        goToTab(JOB_VACANCY_OVERVIEW_TAB_ID);
    }, [goToTab, jobVacancyId, pendingFocus]);

    useEffect(() => {
        if (!pendingFocus) return;
        if (activeTab !== JOB_VACANCY_OVERVIEW_TAB_ID) return;
        clearPendingFocus();
    }, [activeTab, clearPendingFocus, pendingFocus]);

    useEffect(() => {
        if (pendingFocus) return;
        if (!jobVacancyId) return;
        // Novo / Novo cadastro: form sem registro em edicao.
        if (activeTab === CRUD_TAB_FORM && !isEditing) {
            clear();
        }
    }, [activeTab, clear, isEditing, jobVacancyId, pendingFocus]);

    useEffect(() => {
        return () => {
            clear();
        };
    }, [clear]);

    return null;
}
