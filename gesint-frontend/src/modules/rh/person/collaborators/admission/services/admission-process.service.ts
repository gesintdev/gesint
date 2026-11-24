import type {
    AdmissionProcess,
    AdmissionProcessCreateDto,
} from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { AppException } from "@/shared/exceptions/app.exception";
import { apiFetch } from "@/shared/lib/api.client";
class AdmissionProcessService extends BaseService<
    AdmissionProcess,
    AdmissionProcessCreateDto,
    AdmissionProcessCreateDto
> {
    constructor() {
        super("/api/v1/admissions");
    }

    /** Admissão vigente da pessoa. 404/403 viram ausência, para a aba Pessoas cair no cadastro pessoal. */
    async findCurrentByCollaborator(collaboratorId: string): Promise<AdmissionProcess | null> {
        try {
            return await apiFetch<AdmissionProcess>(`${this.basePath}/by-collaborator/${collaboratorId}`);
        } catch (error) {
            if (error instanceof AppException && (error.status === 404 || error.status === 403)) {
                return null;
            }
            throw error;
        }
    }

    /** Gera o código de ponto de uma admissão que ainda não tem. */
    issueAccessCode(id: string): Promise<{ accessCode: string }> {
        return apiFetch<{ accessCode: string }>(`${this.basePath}/${id}/access-code`, { method: "POST" });
    }
}

export const admissionprocessService = new AdmissionProcessService();
