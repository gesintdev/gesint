export class ClientEnvironmentConfig {
    id!: string;
    code!: number;
    status!: string;
    clientId!: string;
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

export class ClientEnvironmentConfigUpsertDto {
    clientId!: string;
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
