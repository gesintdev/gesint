export const candidateKeys = {
    all: ["candidates"] as const,
    detail: (id: string) => ["candidates", id] as const,
};
