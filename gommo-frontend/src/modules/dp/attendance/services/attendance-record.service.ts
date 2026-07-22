import type {
    AttendanceClockPayload,
    AttendanceMobileContext,
    AttendancePresenceRow,
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRequest,
    AttendanceReviewAction,
    AttendanceSettings,
    AttendanceSubmissionPayload,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {BaseService} from "@/modules/root/services/base.service";
import type {PageableResponseDto} from "@/shared/dto/pageable.dto";
import {apiFetch} from "@/shared/lib/api.client";

class AttendanceRecordService extends BaseService<
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRecordCreateDto
> {
    constructor() {
        super("/api/v1/attendance-records");
    }

    listPresence(from: string, to: string) {
        const params = new URLSearchParams({from, to});
        return apiFetch<AttendancePresenceRow[]>(`${this.basePath}/presence?${params.toString()}`);
    }

    listCollaboratorHistory(collaboratorId: string, page = 0, size = 20) {
        const params = new URLSearchParams({page: String(page), size: String(size)});
        return apiFetch<PageableResponseDto<AttendanceRecord>>(
            `${this.basePath}/collaborators/${collaboratorId}/history?${params.toString()}`,
        );
    }

    listRequests() {
        return apiFetch<AttendanceRequest[]>(`${this.basePath}/requests`);
    }

    pendingRequests() {
        return apiFetch<AttendanceRequest[]>(`${this.basePath}/requests/pending`);
    }

    review(id: string, action: AttendanceReviewAction, reason?: string) {
        return apiFetch<AttendanceRequest>(`${this.basePath}/requests/${id}/review`, {
            method: "POST",
            body: {action, reason},
        });
    }

    getSettings() {
        return apiFetch<AttendanceSettings>(`${this.basePath}/settings`);
    }

    updateSettings(settings: AttendanceSettings) {
        return apiFetch<AttendanceSettings>(`${this.basePath}/settings`, {
            method: "PUT",
            body: settings,
        });
    }

    getMobileContext() {
        return apiFetch<AttendanceMobileContext>(`${this.basePath}/mobile/context`);
    }

    listMobileRecords(from: string, to: string) {
        const params = new URLSearchParams({from, to});
        return apiFetch<AttendanceRecord[]>(`${this.basePath}/mobile/records?${params.toString()}`);
    }

    submit(payload: AttendanceSubmissionPayload) {
        return apiFetch<AttendanceRequest>(`${this.basePath}/submissions`, {
            method: "POST",
            body: payload,
        });
    }

    clock(payload: AttendanceClockPayload) {
        return apiFetch<AttendanceRecord>(`${this.basePath}/clock`, {
            method: "POST",
            body: payload,
        });
    }
}

export const attendancerecordService = new AttendanceRecordService();
