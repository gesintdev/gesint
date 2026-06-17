export const departmentKeys = {
    all: ["departments"] as const,
    detail: (id: string) => ["departments", id] as const,
};
