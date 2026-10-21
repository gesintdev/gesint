export const companyKeys = {
    all: ["companies"] as const,
    detail: (id: string) => ["companies", id] as const,
};
