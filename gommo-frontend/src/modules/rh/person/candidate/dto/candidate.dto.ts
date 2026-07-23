export type CandidateExperience = {
    id?: string;
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate?: string;
    currentJob?: boolean;
    description?: string;
};

export class Candidate {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    fullName!: string;
    cpf!: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    city?: string;
    stateCode?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    experiences?: CandidateExperience[];
    createdAt?: string;
    updatedAt?: string;
}

export class CandidateCreateDto {
    fullName!: string;
    cpf!: string;
    email?: string;
    phone?: string;
    birthDate?: string;
    city?: string;
    stateCode?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    experiences?: CandidateExperience[];
}
