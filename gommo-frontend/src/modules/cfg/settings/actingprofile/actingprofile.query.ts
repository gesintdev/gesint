export const actingProfileKeys = {
    all: ["acting-profiles"] as const,
    list: (system?: string) => [...actingProfileKeys.all, "list", system ?? "all"] as const,
    detail: (id: string) => [...actingProfileKeys.all, "detail", id] as const,
};
