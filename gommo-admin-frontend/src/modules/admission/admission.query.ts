export const admissionprocessKeys = {
    all: ["admissions"] as const,
    detail: (id: string) => ["admissions", id] as const,
};
