export const leaverequestKeys = {
    all: ["leave-requests"] as const,
    detail: (id: string) => ["leave-requests", id] as const,
};
