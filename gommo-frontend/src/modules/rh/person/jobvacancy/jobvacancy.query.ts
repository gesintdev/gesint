export const jobVacancyKeys = {
    all: ["job-vacancies"] as const,
    detail: (id: string) => ["job-vacancies", id] as const,
};
