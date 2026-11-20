import type {
    AdmissionProcess,
    AdmissionProcessCreateDto,
} from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";
class AdmissionProcessService extends BaseService<
    AdmissionProcess,
    AdmissionProcessCreateDto,
    AdmissionProcessCreateDto
> {
    constructor() {
        super("/api/v1/admissions");
    }

    /** Gera o código de ponto de uma admissão que ainda não tem. */
    issueAccessCode(id: string): Promise<{ accessCode: string }> {
        return apiFetch<{ accessCode: string }>(`${this.basePath}/${id}/access-code`, { method: "POST" });
    }
}

export const admissionprocessService = new AdmissionProcessService();
