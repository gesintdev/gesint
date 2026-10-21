import type {
    CareersAsset,
    CareersPageDraft,
    CareersPageRequest,
} from "@/modules/careers/admin/dto/careers-page.dto";
import type { CareersSite } from "@/modules/careers/shared/dto/careers.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE = "/api/v1/careers-page";

class CareersPageService {
    getDraft(): Promise<CareersPageDraft> {
        return apiFetch<CareersPageDraft>(BASE);
    }

    saveDraft(request: CareersPageRequest): Promise<CareersPageDraft> {
        return apiFetch<CareersPageDraft>(BASE, { method: "PUT", body: request });
    }

    publish(): Promise<CareersPageDraft> {
        return apiFetch<CareersPageDraft>(`${BASE}/publish`, { method: "POST" });
    }

    discard(): Promise<CareersPageDraft> {
        return apiFetch<CareersPageDraft>(`${BASE}/discard`, { method: "POST" });
    }

    unpublish(): Promise<CareersPageDraft> {
        return apiFetch<CareersPageDraft>(`${BASE}/unpublish`, { method: "POST" });
    }

    uploadAsset(file: File): Promise<CareersAsset> {
        const formData = new FormData();
        formData.append("file", file);
        return apiFetch<CareersAsset>(`${BASE}/assets`, { method: "POST", body: formData });
    }

    /** Vagas reais para o preview (mesma API pública do site). */
    getPublicSite(): Promise<CareersSite> {
        return apiFetch<CareersSite>("/api/v1/public/careers", { skipAuth: true });
    }
}

export const careersPageService = new CareersPageService();

export const careersPageKeys = {
    draft: ["careers-page", "draft"] as const,
    previewSite: ["careers-page", "preview-site"] as const,
};
