export class Candidate {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    fullName!: string;
    cpf!: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class CandidateCreateDto {
    fullName!: string;
    cpf!: string;
    email?: string;
    phone?: string;
    birthDate?: string;
}
