export class MedicalClinic {
    id!: string;
    code!: number;
    status!: string;
    corporateName!: string;
    cnpj!: string;
    address?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    stateId?: string;
    stateCode?: string;
    stateName?: string;
    cityId?: string;
    cityName?: string;
    phone?: string;
    email?: string;
    examsOffered?: string;
    accreditationValidUntil?: string;
}

export class MedicalClinicCreateDto {
    corporateName!: string;
    cnpj!: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    stateId?: string;
    cityId?: string;
    phone?: string;
    email?: string;
    examsOffered?: string;
    accreditationValidUntil?: string;
}
