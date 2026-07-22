import type { Candidate, CandidateCreateDto } from "@/modules/rh/person/candidate/dto/candidate.dto";

export function candidateToFormDto(entity: Candidate): CandidateCreateDto {
    return {
        fullName: entity.fullName ?? "",
        cpf: entity.cpf ?? "",
        email: entity.email ?? "",
        phone: entity.phone ?? "",
        birthDate: entity.birthDate?.slice(0, 10) ?? "",
    };
}

export const emptyCandidateForm = (): CandidateCreateDto => ({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    birthDate: "",
});

export function candidateFormToPayload(form: CandidateCreateDto): CandidateCreateDto {
    return {
        fullName: form.fullName.trim(),
        cpf: form.cpf.replace(/\D/g, ""),
        email: form.email?.trim() || undefined,
        phone: form.phone?.replace(/\D/g, "") || undefined,
        birthDate: form.birthDate?.trim() || undefined,
    };
}
