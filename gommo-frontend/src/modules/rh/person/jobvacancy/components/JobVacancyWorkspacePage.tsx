"use client";

import { lazy, Suspense } from "react";

import { JobVacancyAdmissionProcessExtraTabsController } from "@/modules/rh/person/jobvacancy/components/JobVacancyAdmissionProcessExtraTabsController";
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
            extraTabsController={<JobVacancyAdmissionProcessExtraTabsController />}
        />
    );
}
