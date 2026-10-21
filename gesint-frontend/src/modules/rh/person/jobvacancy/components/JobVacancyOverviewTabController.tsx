"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

import {
    JOB_VACANCY_OVERVIEW_TAB_ID,
    useJobVacancyAdmissionProcessStore,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { CRUD_TAB_FORM, CRUD_TAB_LIST, useCrudScreen } from "@/shared/components/crud/CrudScreen";

/**
 * Foca a sub-aba Vaga apos openDetail.
 * Cadastro vindo da sub-aba da vaga abre a edicao do registro selecionado.
 * Novo cadastro / Cadastro a partir da listagem limpa o vinculo da sub-aba.
 * O destroy da aba principal do workspace tambem limpa o estado.
 */
export function JobVacancyOverviewTabController() {
    const { activeTab, goToTab, isEditing, startEdit } = useCrudScreen();
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const jobVacancyTitle = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyTitle);
    const pendingFocus = useJobVacancyAdmissionProcessStore((state) => state.pendingFocus);
    const clearPendingFocus = useJobVacancyAdmissionProcessStore((state) => state.clearPendingFocus);
    const clear = useJobVacancyAdmissionProcessStore((state) => state.clear);
    const previousTabRef = useRef(activeTab);

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
        const previousTab = previousTabRef.current;
        previousTabRef.current = activeTab;

        if (pendingFocus) return;
        if (activeTab !== CRUD_TAB_FORM || isEditing || !jobVacancyId) return;

        // Veio da sub-aba da vaga → Cadastro deve carregar o registro selecionado.
        if (previousTab === JOB_VACANCY_OVERVIEW_TAB_ID) {
            void startEdit(
                jobVacancyId,
                jobVacancyTitle ? { jobTitle: jobVacancyTitle } : undefined,
            );
            return;
        }

        // Novo cadastro (listagem/formulario) sem edicao: remove a sub-aba intermediaria.
        if (previousTab === CRUD_TAB_LIST || previousTab === CRUD_TAB_FORM) {
            clear();
        }
    }, [
        activeTab,
        clear,
        isEditing,
        jobVacancyId,
        jobVacancyTitle,
        pendingFocus,
        startEdit,
    ]);

    useEffect(() => {
        return () => {
            clear();
        };
    }, [clear]);

    return null;
}
