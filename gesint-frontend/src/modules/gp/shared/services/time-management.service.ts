import type {
    AbsenceCalendar,
    HourBankBalances,
    HourBankStatement,
    TimeDashboard,
    TimesheetCloseResult,
    TimesheetDetail,
    TimesheetList,
    TimeStatusMetric,
    TimeStatusReport,
} from "@/modules/gp/shared/dto/time-management.dto";
import { apiFetch, doRequest } from "@/shared/lib/api.client";

function period(from?: string, to?: string): string {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const query = params.toString();
    return query ? `?${query}` : "";
}

/** API da Gestão de Ponto (painel, status, banco de horas, espelho, agenda, saúde do ponto). */
export const timeManagementService = {
    dashboard(from?: string, to?: string) {
        return apiFetch<TimeDashboard>(`/api/v1/time-management/dashboard${period(from, to)}`);
    },

    status(metric: TimeStatusMetric, from?: string, to?: string) {
        const params = new URLSearchParams({ metric });
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        return apiFetch<TimeStatusReport>(`/api/v1/time-management/status?${params.toString()}`);
    },

    calendar(from: string, to: string) {
        return apiFetch<AbsenceCalendar>(`/api/v1/time-management/calendar${period(from, to)}`);
    },

    runHealthCheck(date?: string) {
        const query = date ? `?date=${encodeURIComponent(date)}` : "";
        return apiFetch<{ notified: number }>(`/api/v1/time-management/health/run${query}`, { method: "POST" });
    },

    hourBank(from: string, to: string) {
        return apiFetch<HourBankBalances>(`/api/v1/hour-bank${period(from, to)}`);
    },

    hourBankStatement(collaboratorId: string, from: string, to: string) {
        return apiFetch<HourBankStatement>(`/api/v1/hour-bank/collaborators/${collaboratorId}${period(from, to)}`);
    },

    timesheets(from: string, to: string) {
        return apiFetch<TimesheetList>(`/api/v1/timesheets${period(from, to)}`);
    },

    timesheet(collaboratorId: string, from: string, to: string) {
        return apiFetch<TimesheetDetail>(`/api/v1/timesheets/collaborators/${collaboratorId}${period(from, to)}`);
    },

    closeTimesheets(from: string, to: string, collaboratorIds?: string[]) {
        return apiFetch<TimesheetCloseResult>(`/api/v1/timesheets/close`, {
            method: "POST",
            body: { from, to, collaboratorIds: collaboratorIds ?? [] },
        });
    },

    reopenTimesheet(collaboratorId: string, from: string, to: string, reason: string) {
        return apiFetch<TimesheetDetail>(`/api/v1/timesheets/collaborators/${collaboratorId}/reopen`, {
            method: "POST",
            body: { from, to, reason },
        });
    },

    timesheetPdf(collaboratorId: string, from: string, to: string): Promise<Blob> {
        return doRequest<Blob>(`/api/v1/timesheets/collaborators/${collaboratorId}/pdf${period(from, to)}`, {
            responseType: "blob",
        });
    },
};

export function timesheetPdfFilename(from: string, to: string): string {
    return `espelho-de-ponto-${from}-a-${to}.pdf`;
}
