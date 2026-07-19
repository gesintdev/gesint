export class Client {
    id!: string;
    code!: number;
    status!: string;
    name!: string;
    legalName?: string;
    slug!: string;
    mobileLoginCode?: string;
    document?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientCreateDto {
    name!: string;
    legalName?: string;
    slug!: string;
    document?: string;
    address?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
}
