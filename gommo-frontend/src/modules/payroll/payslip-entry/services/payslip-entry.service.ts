import type { PayslipEntry, PayslipEntryCreateDto } from "@/modules/payroll/payslip-entry/dto/payslip-entry.dto";
import { BaseService } from "@/modules/root/services/base.service";

class PayslipEntryService extends BaseService<PayslipEntry, PayslipEntryCreateDto, PayslipEntryCreateDto> {
    constructor() {
        super("/api/v1/payslip-entries");
    }
}

export const payslipEntryService = new PayslipEntryService();
