export const jobVacancyApplicationKeys = {
    all: ["job-vacancy-applications"] as const,
    detail: (id: string) => ["job-vacancy-applications", id] as const,
    byVacancy: (jobVacancyId: string) => ["job-vacancy-applications", "by-vacancy", jobVacancyId] as const,
};
