export const workScheduleKeys = {
    all: ["work-schedules"] as const,
    detail: (id: string) => ["work-schedules", id] as const,
    active: ["work-schedules", "active"] as const,
};
