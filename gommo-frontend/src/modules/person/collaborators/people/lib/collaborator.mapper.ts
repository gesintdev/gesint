import type {Collaborator, CollaboratorCreateDto} from "@/modules/person/collaborators/people/dto/collaborator.dto";
import {digitsOnly} from "@/shared/lib/input/digits";
import {unmaskRg} from "@/shared/lib/input/rg";

export function collaboratorFormToPayload(dto: CollaboratorCreateDto): CollaboratorCreateDto {
    return {
        ...dto,
        cpf: digitsOnly(dto.cpf),
        rg: dto.rg ? unmaskRg(dto.rg) : dto.rg,
    };
}

export function collaboratorToFormDto(collaborator: Collaborator): CollaboratorCreateDto {
    return {
        fullName: collaborator.fullName,
        socialName: collaborator.socialName,
        cpf: digitsOnly(collaborator.cpf),
        rg: collaborator.rg ? unmaskRg(collaborator.rg) : collaborator.rg,
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
