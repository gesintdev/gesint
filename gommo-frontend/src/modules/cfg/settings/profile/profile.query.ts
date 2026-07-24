export const profileKeys = {
    all: ["profiles"] as const,
    list: (system?: string, status?: string) =>
        [...profileKeys.all, "list", system ?? "all", status ?? "all"] as const,
    detail: (id: string) => [...profileKeys.all, "detail", id] as const,
};
