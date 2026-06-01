export const appUserKeys = {
    all: ["app-users"] as const,
    detail: (id: string) => [...appUserKeys.all, "detail", id] as const,
};
