export const jobVacancyCompetencyKeys = {
    all: ["job-vacancy-competencies"] as const,
    byVacancy: (jobVacancyId: string) =>
        [...jobVacancyCompetencyKeys.all, "by-vacancy", jobVacancyId] as const,
    detail: (id: string) => [...jobVacancyCompetencyKeys.all, "detail", id] as const,
};
