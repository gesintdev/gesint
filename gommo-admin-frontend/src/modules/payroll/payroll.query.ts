export const payrollrunKeys = {
    all: ["payroll-runs"] as const,
    detail: (id: string) => ["payroll-runs", id] as const,
};
