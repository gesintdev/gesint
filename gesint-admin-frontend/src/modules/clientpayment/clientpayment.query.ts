export const clientPaymentKeys = {
    all: ["client-payments"] as const,
    detail: (id: string) => ["client-payments", id] as const,
};
