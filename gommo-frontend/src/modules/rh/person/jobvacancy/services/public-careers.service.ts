import type {
    PublicJobApplicationPayload,
    PublicJobApplicationResult,
    PublicJobVacancy,
} from "@/modules/rh/person/jobvacancy/dto/public-careers.dto";
import { apiFetch } from "@/shared/lib/api.client";

class PublicCareersService {
    getBySlug(slug: string): Promise<PublicJobVacancy> {
        return apiFetch<PublicJobVacancy>(`/api/v1/public/careers/${encodeURIComponent(slug)}`, {
            skipAuth: true,
        });
    }

    apply(
        slug: string,
        payload: PublicJobApplicationPayload,
        resume?: File | null,
    ): Promise<PublicJobApplicationResult> {
        const formData = new FormData();
        formData.append(
            "data",
            new Blob([JSON.stringify(payload)], { type: "application/json" }),
        );
        if (resume) {
            formData.append("resume", resume);
        }
        return apiFetch<PublicJobApplicationResult>(
            `/api/v1/public/careers/${encodeURIComponent(slug)}/applications`,
            {
                method: "POST",
                body: formData,
                skipAuth: true,
            },
        );
    }
}

export const publicCareersService = new PublicCareersService();
