export const payslipEntryKeys = {
    all: ["payslip-entries"] as const,
    detail: (id: string) => ["payslip-entries", id] as const,
};
