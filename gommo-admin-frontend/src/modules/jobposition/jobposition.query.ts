export const jobpositionKeys = {
    all: ["job-positions"] as const,
    detail: (id: string) => ["job-positions", id] as const,
};
