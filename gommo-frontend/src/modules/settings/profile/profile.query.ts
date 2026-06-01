export const profileKeys = {
    all: ["profiles"] as const,
    list: (system?: string) => [...profileKeys.all, "list", system ?? "all"] as const,
    detail: (id: string) => [...profileKeys.all, "detail", id] as const,
};
