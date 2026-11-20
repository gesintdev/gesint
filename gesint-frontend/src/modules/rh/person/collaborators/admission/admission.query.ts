export const admissionprocessKeys = {
    all: ["admissions"] as const,
    detail: (id: string) => ["admissions", id] as const,
    /** Esteira de Acompanhamento. Prefixo de summary e page, inclusive com filial. */
    pipeline: ["admissions", "pipeline"] as const,
};
