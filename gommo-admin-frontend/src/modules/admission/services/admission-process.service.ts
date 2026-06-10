import type { AdmissionProcess, AdmissionProcessCreateDto } from "@/modules/admission/dto/admission-process.dto";
import { BaseService } from "@/modules/root/services/base.service";
class AdmissionProcessService extends BaseService<
    AdmissionProcess,
    AdmissionProcessCreateDto,
    AdmissionProcessCreateDto
> {
    constructor() {
        super("/api/v1/admissions");
    }
}

export const admissionprocessService = new AdmissionProcessService();
