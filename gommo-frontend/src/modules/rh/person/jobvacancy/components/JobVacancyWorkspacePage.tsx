"use client";

import { lazy, Suspense, useMemo } from "react";

import { JobVacancyOverviewPanel } from "@/modules/rh/person/jobvacancy/components/JobVacancyOverviewPanel";
import { JobVacancyOverviewTabController } from "@/modules/rh/person/jobvacancy/components/JobVacancyOverviewTabController";
import {
    JOB_VACANCY_OVERVIEW_TAB_ID,
    useJobVacancyAdmissionProcessStore,
} from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import type { CrudExtraTab } from "@/shared/components/crud/CrudScreen";
import { TabbedCrudPage } from "@/shared/components/layout/TabbedCrudPage";

const List = lazy(() =>
    import("@/modules/rh/person/jobvacancy/components/JobVacancyListClient").then((m) => ({
        default: m.JobVacancyListClient,
    })),
);
const Form = lazy(() =>
    import("@/modules/rh/person/jobvacancy/components/JobVacancyFormClient").then((m) => ({
        default: m.JobVacancyFormClient,
    })),
);

export function JobVacancyWorkspacePage() {
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const jobVacancyTitle = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyTitle);
    const overviewPanel = useMemo(() => <JobVacancyOverviewPanel />, []);

    const extraTabs = useMemo((): CrudExtraTab[] => {
        if (!jobVacancyId) return [];
        const title = jobVacancyTitle?.trim();
        return [
            {
                id: JOB_VACANCY_OVERVIEW_TAB_ID,
                label: title ? `Vaga - ${title}` : "Vaga",
                permission: "jobvacancy:read",
                content: overviewPanel,
            },
        ];
    }, [jobVacancyId, jobVacancyTitle, overviewPanel]);

    return (
        <TabbedCrudPage
            routeId="job-vacancy"
            href="/job-vacancy"
            routeLabel="Vagas"
            tabShortLabel="Vaga"
            fieldTabName="jobTitle"
            list={
                <Suspense fallback={null}>
                    <List />
                </Suspense>
            }
            form={
                <Suspense fallback={null}>
                    <Form />
                </Suspense>
            }
            extraTabs={extraTabs}
            extraTabsController={<JobVacancyOverviewTabController />}
        />
    );
}
