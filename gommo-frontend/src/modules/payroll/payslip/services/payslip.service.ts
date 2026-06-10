import type { Payslip, PayslipCreateDto } from "@/modules/payroll/payslip/dto/payslip.dto";
import { BaseService } from "@/modules/root/services/base.service";
class PayslipService extends BaseService<Payslip, PayslipCreateDto, PayslipCreateDto> {
    constructor() {
        super("/api/v1/payslips");
    }
}

export const payslipService = new PayslipService();
