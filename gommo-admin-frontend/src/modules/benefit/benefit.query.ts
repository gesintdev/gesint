export const benefitplanKeys = {
    all: ["benefit-plans"] as const,
    detail: (id: string) => ["benefit-plans", id] as const,
};
