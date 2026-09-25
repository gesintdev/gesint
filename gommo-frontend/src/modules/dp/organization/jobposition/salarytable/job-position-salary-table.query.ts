export const jobPositionSalaryTableKeys = {
    all: ["job-position-salary-tables"] as const,
    detail: (id: string) => [...jobPositionSalaryTableKeys.all, "detail", id] as const,
    byJobPosition: (jobPositionId: string) =>
        [...jobPositionSalaryTableKeys.all, "job-position", jobPositionId] as const,
    current: (jobPositionId: string) =>
        [...jobPositionSalaryTableKeys.all, "job-position", jobPositionId, "current"] as const,
};
