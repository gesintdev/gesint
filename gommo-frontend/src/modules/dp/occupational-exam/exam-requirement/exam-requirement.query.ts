export const examRequirementKeys = {
    all: ["exam-requirements"] as const,
    detail: (id: string) => ["exam-requirements", id] as const,
};
