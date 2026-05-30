export const exitinterviewKeys = {
    all: ["exit-interviews"] as const,
    detail: (id: string) => ["exit-interviews", id] as const,
};
