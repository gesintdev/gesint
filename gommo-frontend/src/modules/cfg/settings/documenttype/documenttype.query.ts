export const documentTypeKeys = {
    all: ["document-types"] as const,
    detail: (id: string) => ["document-types", "detail", id] as const,
    byContext: (context: string) => ["document-types", "by-context", context] as const,
};
