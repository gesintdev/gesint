export const payslipKeys = {
    all: ["payslips"] as const,
    detail: (id: string) => ["payslips", id] as const,
};
