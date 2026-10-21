"use client";

import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Suspense, useEffect, useMemo } from "react";

import { JobVacancyAdmissionProcessTab } from "@/modules/rh/person/jobvacancy/components/JobVacancyAdmissionProcessTab";
import { JobVacancyDetailTab } from "@/modules/rh/person/jobvacancy/components/JobVacancyDetailTab";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import {
    type JobVacancyInnerPanel,
    useJobVacancyAdmissionProcessStore,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { hasPermission, useSessionPermissions } from "@/shared/auth/permissions";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";

const DETAIL_STEP: FormStepNavItem = { id: "detail", label: "Detalhamento" };
const CANDIDATES_STEP: FormStepNavItem = { id: "candidates", label: "Candidatos" };

/** Conteudo da sub-aba Vaga: steps Detalhamento / Candidatos. */
export function JobVacancyOverviewPanel() {
    const permissions = useSessionPermissions();
    const canViewCandidates = hasPermission(permissions, "admission:read");
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const innerPanel = useJobVacancyAdmissionProcessStore((state) => state.innerPanel);
    const setInnerPanel = useJobVacancyAdmissionProcessStore((state) => state.setInnerPanel);

    const detailQuery = useQuery({
        queryKey: jobVacancyKeys.detail(jobVacancyId ?? ""),
        queryFn: () => jobVacancyService.getById(jobVacancyId!),
        enabled: Boolean(jobVacancyId),
    });

    const steps = useMemo((): FormStepNavItem[] => {
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
        <div className="form-stepper flex h-full min-h-0 flex-1 flex-col">
            <div className="form-stepper__toolbar-shell shrink-0">
                <div
                    className={clsx(
                        "gesint-form-section form-stepper__toolbar",
                        detailQuery.data?.code == null && "form-stepper__toolbar--no-code",
                    )}
                >
                    {detailQuery.data?.code != null ? (
                        <div className="form-stepper__code">
                            <EntityCodeField code={detailQuery.data.code} codeOnly />
                        </div>
                    ) : null}
                    <nav className="gesint-form-stepper" aria-label="Seções da vaga">
                        <ol className="gesint-form-stepper__list gesint-form-stepper__list--spread">
                            {steps.map((step, index) => {
                                const isActive = step.id === activePanel;
                                return (
                                    <li
                                        key={step.id}
                                        className={clsx(
                                            "gesint-form-stepper__item",
                                            index < steps.length - 1 && "gesint-form-stepper__item--has-line",
                                        )}
                                    >
                                        {index < steps.length - 1 ? (
                                            <span className="gesint-form-stepper__line" aria-hidden />
                                        ) : null}
                                        <button
                                            type="button"
                                            className={clsx(
                                                "gesint-form-stepper__step",
                                                isActive && "gesint-form-stepper__step--active",
                                            )}
                                            aria-current={isActive ? "step" : undefined}
                                            onClick={() => setInnerPanel(step.id as JobVacancyInnerPanel)}
                                        >
                                            <span className="gesint-form-stepper__badge">{index + 1}</span>
                                            <span className="gesint-form-stepper__label">{step.label}</span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>
                    </nav>
                </div>
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
