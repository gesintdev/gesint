export type AdmissionStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "NOT_INFORMED";

export type MaritalStatus = "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED" | "OTHER";

export type ContractType = "CLT" | "PJ" | "INTERMITTENT" | "APPRENTICE" | "INTERN";

export type RecessFinancialMode = "FULLY_PAID" | "UNPAID" | "PROPORTIONAL" | "CUSTOM";

export type AdmissionEmergencyContact = {
    name: string;
    phone: string;
    relationship?: string;
};

export class AdmissionProcess {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId?: string;
    collaboratorStatus?: "ACTIVE" | "INACTIVE" | "DELETED";
    photoObjectId?: string;
    admissionStatus!: AdmissionStatus;
    inVacation?: boolean;
    onLeave?: boolean;
    completedStepCount?: number;
    requiredStepCount?: number;
    completedStepIds?: string[];
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
    cityId?: string;
    cityName?: string;
    stateId?: string;
    stateCode?: string;
    stateName?: string;
    expectedStartDate!: string;
    companyId?: string;
    departmentId?: string;
    departmentName?: string;
    jobPositionId?: string;
    contractType!: ContractType;
    baseSalary?: number;
    workloadSchedule?: string;
    emergencyContacts?: AdmissionEmergencyContact[];
    contractStartDate?: string;
    contractEndDate?: string;
    providerCnpj?: string;
    providerLegalName?: string;
    providerTradeName?: string;
    recessEnabled?: boolean;
    recessTotalDaysPerCycle?: number;
    recessCycleMonths?: number;
    recessEligibilityAfterMonths?: number;
    recessFinancialMode?: RecessFinancialMode;
    recessPaidPercentage?: number;
    recessAllowSplit?: boolean;
    recessMaxSplitPeriods?: number;
    recessMinimumSplitDays?: number;
    recessAdvanceNoticeDays?: number;
    recessNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class AdmissionProcessCreateDto {
    admissionStatus?: AdmissionStatus;
    startedAt?: string;
    notes?: string;
    photoObjectId?: string;
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
    cityId?: string;
    stateId?: string;
    expectedStartDate!: string;
    companyId?: string;
    departmentId?: string;
    jobPositionId?: string;
    contractType!: ContractType;
    /** Formulário: string (moeda/decimal); API: number */
    baseSalary?: string | number;
    workloadSchedule?: string;
    emergencyContacts?: AdmissionEmergencyContact[];
    contractStartDate?: string;
    contractEndDate?: string;
    providerCnpj?: string;
    providerLegalName?: string;
    providerTradeName?: string;
    recessEnabled?: boolean;
    recessTotalDaysPerCycle?: string | number;
    recessCycleMonths?: string | number;
    recessEligibilityAfterMonths?: string | number;
    recessFinancialMode?: RecessFinancialMode;
    recessPaidPercentage?: string | number;
    recessAllowSplit?: boolean;
    recessMaxSplitPeriods?: string | number;
    recessMinimumSplitDays?: string | number;
    recessAdvanceNoticeDays?: string | number;
    recessNotes?: string;
}
