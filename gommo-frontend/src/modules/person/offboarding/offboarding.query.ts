export const offboardingKeys = {
    all: ["offboardings"] as const,
    detail: (id: string) => ["offboardings", id] as const,
};
