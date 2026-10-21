import type {
    CareersApplicationPayload,
    CareersApplicationResult,
    CareersSite,
    CareersVacancy,
} from "@/modules/careers/shared/dto/careers.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE = "/api/v1/public/careers";

class CareersSiteService {
    getSite(): Promise<CareersSite> {
        return apiFetch<CareersSite>(BASE, { skipAuth: true });
    }

    getVacancy(slug: string): Promise<CareersVacancy> {
        return apiFetch<CareersVacancy>(`${BASE}/${encodeURIComponent(slug)}`, { skipAuth: true });
    }

    apply(slug: string, payload: CareersApplicationPayload, resume?: File | null): Promise<CareersApplicationResult> {
        const formData = new FormData();
        formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
        if (resume) {
            formData.append("resume", resume);
        }
        return apiFetch<CareersApplicationResult>(`${BASE}/${encodeURIComponent(slug)}/applications`, {
            method: "POST",
            body: formData,
            skipAuth: true,
        });
    }
}

export const careersSiteService = new CareersSiteService();

export const careersSiteKeys = {
    site: ["careers-site"] as const,
    vacancy: (slug: string) => ["careers-site", "vacancy", slug] as const,
};
