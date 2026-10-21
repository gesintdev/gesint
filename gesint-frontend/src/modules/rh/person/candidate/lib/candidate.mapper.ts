import type {
    Candidate,
    CandidateCreateDto,
    CandidateExperience,
} from "@/modules/rh/person/candidate/dto/candidate.dto";

export function emptyExperience(): CandidateExperience {
    return {
        companyName: "",
        jobTitle: "",
        startDate: "",
        endDate: "",
        currentJob: false,
        description: "",
    };
}

export function candidateToFormDto(entity: Candidate): CandidateCreateDto {
    return {
        fullName: entity.fullName ?? "",
        cpf: entity.cpf ?? "",
        email: entity.email ?? "",
        phone: entity.phone ?? "",
        birthDate: entity.birthDate?.slice(0, 10) ?? "",
        city: entity.city ?? "",
        stateCode: entity.stateCode ?? "",
        linkedinUrl: entity.linkedinUrl ?? "",
        portfolioUrl: entity.portfolioUrl ?? "",
        experiences:
            entity.experiences?.map((item) => ({
                id: item.id,
                companyName: item.companyName ?? "",
                jobTitle: item.jobTitle ?? "",
                startDate: item.startDate?.slice(0, 10) ?? "",
                endDate: item.endDate?.slice(0, 10) ?? "",
                currentJob: Boolean(item.currentJob),
                description: item.description ?? "",
            })) ?? [],
    };
}

export const emptyCandidateForm = (): CandidateCreateDto => ({
    fullName: "",
    cpf: "",
    email: "",
    phone: "",
    birthDate: "",
    city: "",
    stateCode: "",
    linkedinUrl: "",
    portfolioUrl: "",
    experiences: [],
});

export function candidateFormToPayload(form: CandidateCreateDto): CandidateCreateDto {
    return {
        fullName: form.fullName.trim(),
        cpf: form.cpf.replace(/\D/g, ""),
        email: form.email?.trim() || undefined,
        phone: form.phone?.replace(/\D/g, "") || undefined,
        birthDate: form.birthDate?.trim() || undefined,
        city: form.city?.trim() || undefined,
        stateCode: form.stateCode?.trim()?.toUpperCase() || undefined,
        linkedinUrl: form.linkedinUrl?.trim() || undefined,
        portfolioUrl: form.portfolioUrl?.trim() || undefined,
        experiences: (form.experiences ?? [])
            .filter((item) => item.companyName.trim() && item.jobTitle.trim() && item.startDate.trim())
            .map((item) => ({
                id: item.id,
                companyName: item.companyName.trim(),
                jobTitle: item.jobTitle.trim(),
                startDate: item.startDate.trim(),
                endDate: item.currentJob ? undefined : item.endDate?.trim() || undefined,
                currentJob: Boolean(item.currentJob),
                description: item.description?.trim() || undefined,
            })),
    };
}
