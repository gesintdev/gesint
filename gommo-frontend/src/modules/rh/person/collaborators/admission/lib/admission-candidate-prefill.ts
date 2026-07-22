import type { AdmissionProcessCreateDto } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";

export const ADMISSION_CANDIDATE_PREFILL_STORAGE_KEY = "gommo-admission-candidate-prefill";

export type AdmissionCandidatePrefill = {
    fullName?: string;
    cpf?: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    candidateId?: string;
    jobVacancyId?: string;
};

export function storeAdmissionCandidatePrefill(prefill: AdmissionCandidatePrefill): void {
    window.sessionStorage.setItem(ADMISSION_CANDIDATE_PREFILL_STORAGE_KEY, JSON.stringify(prefill));
}

export function consumeAdmissionCandidatePrefill(): Partial<AdmissionProcessCreateDto> | null {
    const raw = window.sessionStorage.getItem(ADMISSION_CANDIDATE_PREFILL_STORAGE_KEY);
    if (!raw) return null;
    window.sessionStorage.removeItem(ADMISSION_CANDIDATE_PREFILL_STORAGE_KEY);
    try {
        const parsed = JSON.parse(raw) as AdmissionCandidatePrefill;
        const next: Partial<AdmissionProcessCreateDto> = {};
        const fullName = parsed.fullName?.trim();
        const cpf = parsed.cpf?.replace(/\D/g, "");
        const email = parsed.email?.trim();
        const phone = parsed.phone?.replace(/\D/g, "");
        const birthDate = parsed.birthDate?.slice(0, 10);
        if (fullName) next.fullName = fullName;
        if (cpf) next.cpf = cpf;
        if (email) next.email = email;
        if (phone) next.phone = phone;
        if (birthDate) next.birthDate = birthDate;
        return Object.keys(next).length > 0 ? next : null;
    } catch {
        return null;
    }
}
