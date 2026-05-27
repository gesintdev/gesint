export const clientUserKeys = {
    all: ["client-users"] as const,
    detail: (id: string) => ["client-users", id] as const,
};
