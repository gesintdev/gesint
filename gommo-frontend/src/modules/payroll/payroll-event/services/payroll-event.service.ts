import type { PayrollEvent, PayrollEventCreateDto } from "@/modules/payroll/payroll-event/dto/payroll-event.dto";
import { BaseService } from "@/modules/root/services/base.service";

class PayrollEventService extends BaseService<PayrollEvent, PayrollEventCreateDto, PayrollEventCreateDto> {
    constructor() {
        super("/api/v1/payroll-events");
    }
}

export const payrollEventService = new PayrollEventService();
