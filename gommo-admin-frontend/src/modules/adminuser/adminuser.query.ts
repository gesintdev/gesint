export const adminUserKeys = {
    all: ["admin-users"] as const,
    detail: (id: string) => ["admin-users", id] as const,
};
