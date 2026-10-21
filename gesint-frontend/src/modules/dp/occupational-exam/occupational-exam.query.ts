export const occupationalExamKeys = {
    all: ["occupational-exam"] as const,
    detail: (id: string) => ["occupational-exam", id] as const,
    due: (days: number) => ["occupational-exam", "due", days] as const,
    overdue: ["occupational-exam", "overdue"] as const,
    indicators: ["occupational-exam", "indicators"] as const,
};
