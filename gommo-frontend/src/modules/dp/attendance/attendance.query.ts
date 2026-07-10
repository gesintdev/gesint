export const attendancerecordKeys = {
    all: ["attendance-records"] as const,
    detail: (id: string) => ["attendance-records", id] as const,
};
