export const performanceReviewKeys = {
    all: ["performance-reviews"] as const,
    detail: (id: string) => ["performance-reviews", id] as const,
};
