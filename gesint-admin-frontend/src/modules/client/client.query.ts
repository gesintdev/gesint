export const clientKeys = {
    all: ["clients"] as const,
    detail: (id: string) => ["clients", id] as const,
};
