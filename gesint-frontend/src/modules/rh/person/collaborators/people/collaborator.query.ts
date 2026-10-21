export const collaboratorKeys = {
    all: ["collaborators"] as const,
    detail: (id: string) => ["collaborators", id] as const,
};
