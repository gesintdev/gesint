export class MedicalClinic {
    id!: string;
    code!: number;
    status!: string;
    corporateName!: string;
    cnpj!: string;
    address?: string;
    phone?: string;
    email?: string;
    examsOffered?: string;
    accreditationValidUntil?: string;
}

export class MedicalClinicCreateDto {
    corporateName!: string;
    cnpj!: string;
    address?: string;
    phone?: string;
    email?: string;
    examsOffered?: string;
    accreditationValidUntil?: string;
}
