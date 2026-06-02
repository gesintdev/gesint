export class Collaborator {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    fullName!: string;
    socialName?: string;
    cpf!: string;
    rg?: string;
    rgIssuer?: string;
    rgStateCode?: string;
    birthDate!: string;
    gender?: "MALE" | "FEMALE" | "OTHER" | "NOT_INFORMED";
    maritalStatus?: "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER";
    motherName?: string;
    fatherName?: string;
    nationality?: string;
    pisPasep?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type CollaboratorWriteDto = CollaboratorCreateDto;

export class CollaboratorCreateDto {
    fullName!: string;
    socialName?: string;
    cpf!: string;
    rg?: string;
    rgIssuer?: string;
    rgStateCode?: string;
    birthDate!: string;
    gender?: Collaborator["gender"];
    maritalStatus?: Collaborator["maritalStatus"];
    motherName?: string;
    fatherName?: string;
    nationality?: string;
    pisPasep?: string;
}
