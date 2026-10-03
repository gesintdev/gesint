import type {
    EsocialDismissalReasonDto,
    Offboarding,
    OffboardingAccountantPackageDto,
    OffboardingCreateDto,
    OffboardingDemissionalPreviewDto,
} from "@/modules/dp/offboarding/dto/offboarding.dto";
import {BaseService} from "@/modules/root/services/base.service";
import {apiFetch} from "@/shared/lib/api.client";

class OffboardingService extends BaseService<Offboarding, OffboardingCreateDto, OffboardingCreateDto> {
    constructor() {
        super("/api/v1/offboardings");
    }

    listEsocialDismissalReasons(): Promise<EsocialDismissalReasonDto[]> {
        return apiFetch<EsocialDismissalReasonDto[]>(`${this.basePath}/esocial-dismissal-reasons`);
    }

    demissionalPreview(id: string): Promise<OffboardingDemissionalPreviewDto> {
        return apiFetch<OffboardingDemissionalPreviewDto>(`${this.basePath}/${id}/demissional-preview`);
    }

    registerDemissionalWaiver(id: string, notes?: string): Promise<Offboarding> {
        return apiFetch<Offboarding>(`${this.basePath}/${id}/demissional-waiver`, {
            method: "POST",
            body: {notes: notes ?? ""},
        });
    }

    conclude(id: string): Promise<Offboarding> {
        return apiFetch<Offboarding>(`${this.basePath}/${id}/conclude`, {method: "POST"});
    }

    accountantPackagePreview(id: string): Promise<OffboardingAccountantPackageDto> {
        return apiFetch<OffboardingAccountantPackageDto>(`${this.basePath}/${id}/accountant-package`);
    }

    sendAccountantPackage(id: string): Promise<OffboardingAccountantPackageDto> {
        return apiFetch<OffboardingAccountantPackageDto>(`${this.basePath}/${id}/accountant-package`, {
            method: "POST",
        });
    }
}

export const offboardingService = new OffboardingService();
