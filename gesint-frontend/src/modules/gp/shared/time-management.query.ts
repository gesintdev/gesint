import type { TimeStatusMetric } from "@/modules/gp/shared/dto/time-management.dto";

/** Chaves de cache da Gestão de Ponto. O escopo de filial entra via QueryPanel/useBranchScopedQueryKey. */
export const timeManagementKeys = {
    all: ["time-management"] as const,
    dashboard: (from: string, to: string) => ["time-management", "dashboard", from, to] as const,
    status: (metric: TimeStatusMetric, from: string, to: string) =>
        ["time-management", "status", metric, from, to] as const,
    calendar: (from: string, to: string) => ["time-management", "calendar", from, to] as const,
    hourBank: ["time-management", "hour-bank"] as const,
    timesheets: ["time-management", "timesheets"] as const,
    timesheet: (collaboratorId: string, from: string, to: string) =>
        ["time-management", "timesheets", collaboratorId, from, to] as const,
};
