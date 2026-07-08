import type {
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceReviewAction,
    AttendanceSettings,
} from "@/modules/dp/organization/attendance/dto/attendance-record.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class AttendanceRecordService extends BaseService<
    AttendanceRecord,
    AttendanceRecordCreateDto,
    AttendanceRecordCreateDto
> {
    constructor() {
        super("/api/v1/attendance-records");
    }

    pendingRequests() {
        return apiFetch<AttendanceRecord[]>(`${this.basePath}/requests/pending`);
    }

    review(id: string, action: AttendanceReviewAction, reason?: string) {
        return apiFetch<AttendanceRecord>(`${this.basePath}/${id}/review`, {
            method: "POST",
            body: { action, reason },
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
}

export const attendancerecordService = new AttendanceRecordService();

