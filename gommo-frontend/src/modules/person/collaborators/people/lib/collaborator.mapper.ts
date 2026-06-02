import type {Collaborator, CollaboratorCreateDto} from "@/modules/person/collaborators/people/dto/collaborator.dto";
import {digitsOnly} from "@/shared/lib/input/digits";

export function collaboratorFormToPayload(dto: CollaboratorCreateDto): CollaboratorCreateDto {
    return {
        ...dto,
        cpf: digitsOnly(dto.cpf),
        rg: dto.rg ? digitsOnly(dto.rg).slice(0, 7) : dto.rg,
        rgIssuer: dto.rgIssuer?.trim() || undefined,
        rgStateCode: dto.rgStateCode?.trim().toUpperCase() || undefined,
    };
}

export function collaboratorToFormDto(collaborator: Collaborator): CollaboratorCreateDto {
    return {
        fullName: collaborator.fullName,
        socialName: collaborator.socialName,
        cpf: digitsOnly(collaborator.cpf),
        rg: collaborator.rg ? digitsOnly(collaborator.rg).slice(0, 7) : collaborator.rg,
        rgIssuer: collaborator.rgIssuer ?? "",
        rgStateCode: collaborator.rgStateCode ?? "",
        birthDate: collaborator.birthDate?.slice(0, 10) ?? "",
        gender: collaborator.gender,
        maritalStatus: collaborator.maritalStatus,
        motherName: collaborator.motherName,
        fatherName: collaborator.fatherName,
        nationality: collaborator.nationality,
        pisPasep: collaborator.pisPasep,
    };
}

export const emptyCollaboratorForm = (): CollaboratorCreateDto => ({
    fullName: "",
    cpf: "",
    birthDate: "",
});
