import type { WorkSchedule, WorkScheduleCreateDto } from "@/modules/cfg/settings/workschedule/dto/work-schedule.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class WorkScheduleService extends BaseService<WorkSchedule, WorkScheduleCreateDto, WorkScheduleCreateDto> {
    constructor() {
        super("/api/v1/work-schedules");
    }

    listActive() {
        return apiFetch<WorkSchedule[]>(`${this.basePath}/active`);
    }
}

export const workScheduleService = new WorkScheduleService();
