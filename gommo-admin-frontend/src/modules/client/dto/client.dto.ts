export class Client {
    id!: string;
    status!: string;
    name!: string;
    slug!: string;
    document?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
    routingMode?: string;
    subdomain?: string;
    customDomain?: string;
    databaseStrategy?: string;
    databaseHost?: string;
    databasePort?: number;
    databaseName?: string;
    databaseSchema?: string;
    databaseUser?: string;
    databaseSecretRef?: string;
    provisioningStatus?: string;
    provisioningNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientCreateDto {
    name!: string;
    slug!: string;
    document?: string;
    contactEmail?: string;
    contactPhone?: string;
    notes?: string;
    routingMode?: string;
    subdomain?: string;
    customDomain?: string;
    databaseStrategy?: string;
    databaseHost?: string;
    databasePort?: number;
    databaseName?: string;
    databaseSchema?: string;
    databaseUser?: string;
    databaseSecretRef?: string;
    provisioningStatus?: string;
    provisioningNotes?: string;
}
