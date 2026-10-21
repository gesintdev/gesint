export const experienceEvaluationKeys = {
    all: ["experience-evaluations"] as const,
    summary: ["experience-evaluations", "summary"] as const,
    queue: (bucket: string) => ["experience-evaluations", "queue", bucket] as const,
    detail: (id: string) => ["experience-evaluations", "detail", id] as const,
};
