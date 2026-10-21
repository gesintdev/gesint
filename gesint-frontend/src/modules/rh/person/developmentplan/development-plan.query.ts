export const developmentPlanKeys = {
    all: ["development-plans"] as const,
    detail: (id: string) => ["development-plans", id] as const,
};