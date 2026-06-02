export type AdmissionStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "NOT_INFORMED";
export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER";
export type ContractType = "CLT" | "PJ" | "INTERMITTENT" | "APPRENTICE" | "INTERN";

export class AdmissionProcess {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId?: string;
    admissionStatus!: AdmissionStatus;
    startedAt?: string;
    completedAt?: string;
    notes?: string;

    fullName!: string;
    socialName?: string;
    cpf!: string;
    rg?: string;
    rgIssuer?: string;
    rgStateCode?: string;
    birthDate!: string;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    motherName?: string;
    fatherName?: string;
    nationality?: string;
    pisPasep?: string;
    email?: string;
    phone?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;

    expectedStartDate!: string;
    companyId?: string;
    departmentId?: string;
    jobPositionId?: string;
    contractType!: ContractType;
    baseSalary?: number;
    workloadHours?: number;

    createdAt?: string;
    updatedAt?: string;
}

export class AdmissionProcessCreateDto {
    admissionStatus?: AdmissionStatus;
    startedAt?: string;
    notes?: string;

    fullName!: string;
    socialName?: string;
    cpf!: string;
    rg?: string;
    rgIssuer?: string;
    rgStateCode?: string;
    birthDate!: string;
    gender?: Gender;
    maritalStatus?: MaritalStatus;
    motherName?: string;
    fatherName?: string;
    nationality?: string;
    pisPasep?: string;
    email?: string;
    phone?: string;
    zipCode?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;

    expectedStartDate!: string;
    companyId?: string;
    departmentId?: string;
    jobPositionId?: string;
    contractType!: ContractType;
    /** Formulário: string (moeda/decimal); API: number */
    baseSalary?: string | number;
    workloadHours?: string | number;
}
