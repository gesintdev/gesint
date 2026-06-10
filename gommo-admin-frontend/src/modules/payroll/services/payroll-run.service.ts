import type { PayrollRun, PayrollRunCreateDto } from "@/modules/payroll/dto/payroll-run.dto";
import { BaseService } from "@/modules/root/services/base.service";
class PayrollRunService extends BaseService<PayrollRun, PayrollRunCreateDto, PayrollRunCreateDto> {
    constructor() {
        super("/api/v1/payroll-runs");
    }
}

export const payrollrunService = new PayrollRunService();
