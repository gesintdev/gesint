export const admissionProcessKanbanColumnKeys = {
    all: ["admission-process-kanban-columns"] as const,
    detail: (id: string) => ["admission-process-kanban-columns", id] as const,
};
