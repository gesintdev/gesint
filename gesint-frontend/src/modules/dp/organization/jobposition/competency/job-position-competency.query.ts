export const jobPositionCompetencyKeys = {
    all: ["job-position-competencies"] as const,
    detail: (id: string) => [...jobPositionCompetencyKeys.all, "detail", id] as const,
    byJobPosition: (jobPositionId: string) =>
        [...jobPositionCompetencyKeys.all, "job-position", jobPositionId] as const,
};
