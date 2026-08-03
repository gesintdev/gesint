export const digitalCertificateKeys = {
    all: ["digital-certificates"] as const,
    detail: (id: string) => ["digital-certificates", id] as const,
};
