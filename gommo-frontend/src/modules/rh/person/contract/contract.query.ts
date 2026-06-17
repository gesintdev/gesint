export const employmentcontractKeys = {
    all: ["contracts"] as const,
    detail: (id: string) => ["contracts", id] as const,
};
