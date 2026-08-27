import type {
    AdmissionPipelineRow,
    AdmissionPipelineSummary,
} from "@/modules/rh/person/collaborators/admission/dto/admission-pipeline.dto";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE_PATH = "/api/v1/admissions/pipeline";

class AdmissionPipelineService {
    summary(): Promise<AdmissionPipelineSummary> {
        return apiFetch<AdmissionPipelineSummary>(`${BASE_PATH}/summary`);
    }

    getPage(page = 0, size = 10): Promise<PageableResponseDto<AdmissionPipelineRow>> {
        const params = new URLSearchParams({ page: String(page), size: String(size) });
        return apiFetch<PageableResponseDto<AdmissionPipelineRow>>(`${BASE_PATH}/page?${params.toString()}`);
    }
}

export const admissionPipelineService = new AdmissionPipelineService();
