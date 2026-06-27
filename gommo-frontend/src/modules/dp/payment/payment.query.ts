export const paymentPeriodKeys = {
    all: ["payment-period"] as const,
    detail: (id: string) => ["payment-period", id] as const,
};
export const paymentBatchKeys = {
    byPeriod: (periodId: string) => ["payment-batch", "period", periodId] as const,
    slips: (batchId: string, status?: string) => ["payment-slip", batchId, status ?? "all"] as const,
};
