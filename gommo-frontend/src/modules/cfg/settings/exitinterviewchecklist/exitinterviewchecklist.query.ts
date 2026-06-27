export const exitInterviewReturnChecklistConfigKeys = {
    all: ["exit-interview-return-checklist-items"] as const,
    detail: (id: string) => ["exit-interview-return-checklist-items", id] as const,
};
