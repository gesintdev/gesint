export const payrollEventKeys = {
    all: ["payroll-events"] as const,
    detail: (id: string) => ["payroll-events", id] as const,
};
