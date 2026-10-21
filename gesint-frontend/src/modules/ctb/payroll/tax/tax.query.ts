export const taxObligationKeys = {
    all: ["tax-obligations"] as const,
    detail: (id: string) => ["tax-obligations", id] as const,
};
