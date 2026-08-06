export const occupationalPhysicianKeys = {
    all: ["occupational-physicians"] as const,
    detail: (id: string) => ["occupational-physicians", id] as const,
};
