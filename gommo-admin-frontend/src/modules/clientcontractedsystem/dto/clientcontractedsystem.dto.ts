export class ClientContractedSystem {
    id!: string;
    code!: number;
    status!: string;
    clientId!: string;
    productSystemId!: string;
    productSystemKey?: string;
    name!: string;
    moduleName?: string;
    operationalStatus?: string;
    statusDate?: string;
    returnDate?: string;
    negotiatedAmount?: number;
    discountPercent?: number;
    agreedAmount?: number;
    contractType?: string;
    contractDate?: string;
    endDate?: string;
    dueDay?: string;
    lateTolerance?: string;
    withAi!: boolean;
    effectiveFrom?: string;
    deactivateAt?: string;
    sessionPolicy?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientContractedSystemCreateDto {
    clientId!: string;
    productSystemId!: string;
    operationalStatus?: string;
    statusDate?: string;
    returnDate?: string;
    negotiatedAmount?: number;
    discountPercent?: number;
    agreedAmount?: number;
    contractType?: string;
    contractDate?: string;
    endDate?: string;
    dueDay?: string;
    lateTolerance?: string;
    withAi?: boolean;
    effectiveFrom?: string;
    deactivateAt?: string;
    sessionPolicy?: string;
    notes?: string;
}
