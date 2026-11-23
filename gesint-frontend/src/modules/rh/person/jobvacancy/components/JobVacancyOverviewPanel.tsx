"use client";

import clsx from "clsx";
import { Suspense, useEffect, useMemo } from "react";

import { JobVacancyAdmissionProcessTab } from "@/modules/rh/person/jobvacancy/components/JobVacancyAdmissionProcessTab";
import { JobVacancyDetailTab } from "@/modules/rh/person/jobvacancy/components/JobVacancyDetailTab";
import {
    type JobVacancyInnerPanel,
    useJobVacancyAdmissionProcessStore,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { hasPermission, useSessionPermissions } from "@/shared/auth/permissions";

const DETAIL_STEP = { id: "detail" as const, label: "Detalhamento" };
const CANDIDATES_STEP = { id: "candidates" as const, label: "Candidatos" };

/** Conteudo da sub-aba Vaga: Detalhamento / Candidatos. */
export function JobVacancyOverviewPanel() {
    const permissions = useSessionPermissions();
    const canViewCandidates = hasPermission(permissions, "admission:read");
    const innerPanel = useJobVacancyAdmissionProcessStore((state) => state.innerPanel);
    const setInnerPanel = useJobVacancyAdmissionProcessStore((state) => state.setInnerPanel);

    const steps = useMemo(() => {
        if (canViewCandidates) return [DETAIL_STEP, CANDIDATES_STEP];
        return [DETAIL_STEP];
    }, [canViewCandidates]);

    const activePanel: JobVacancyInnerPanel =
        !canViewCandidates && innerPanel === "candidates" ? "detail" : innerPanel;

    useEffect(() => {
        if (!canViewCandidates && innerPanel === "candidates") {
            setInnerPanel("detail");
        }
    }, [canViewCandidates, innerPanel, setInnerPanel]);

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col">
            <div className="gesint-crud-tablist" role="tablist" aria-label="Seções da vaga">
                {steps.map((step) => {
                    const selected = step.id === activePanel;
                    return (
                        <button
                            key={step.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            className={clsx("gesint-crud-tab", selected && "gesint-crud-tab--active")}
                            onClick={() => setInnerPanel(step.id)}
                        >
                            <span>{step.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                {activePanel === "candidates" && canViewCandidates ? (
                    <Suspense fallback={null}>
                        <JobVacancyAdmissionProcessTab />
                    </Suspense>
                ) : (
                    <Suspense fallback={null}>
                        <JobVacancyDetailTab />
                    </Suspense>
                )}
            </div>
        </div>
    );
}
