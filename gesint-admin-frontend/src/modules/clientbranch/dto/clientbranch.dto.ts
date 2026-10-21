export class ClientBranch {
    id!: string;
    code!: number;
    status!: string;
    clientId!: string;
    tenantCompanyId?: string | null;
    sortOrder!: number;
    legalName!: string;
    tradeName?: string;
    cnpj!: string;
    stateRegistration?: string;
    municipalRegistration?: string;
    email?: string;
    phone?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;
    zipCode?: string;
    provisionedAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientBranchCreateDto {
    clientId!: string;
    legalName!: string;
    tradeName?: string;
    cnpj!: string;
    sortOrder!: number;
    stateRegistration?: string;
    municipalRegistration?: string;
    email?: string;
    phone?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    stateCode?: string;
    zipCode?: string;
}
