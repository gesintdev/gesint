export class SessionBootstrapProfile {
    name?: string;
    username?: string;
    email?: string;
    tenantSlug?: string;
    tenantName?: string;
    platformAdmin!: boolean;
    collaboratorId?: string;
    photoObjectId?: string;
    jobPositionId?: string;
    jobPositionName?: string;
    departmentId?: string;
    departmentName?: string;
}

export class SessionBootstrap {
    name?: string;
    username?: string;
    email?: string;
    tenantSlug?: string;
    tenantName?: string;
    platformAdmin!: boolean;
    collaboratorId?: string;
    photoObjectId?: string;
    jobPositionId?: string;
    jobPositionName?: string;
    departmentId?: string;
    departmentName?: string;
    permissions!: string[];
    systemPermissions!: Record<string, string[]> | null;
    branches!: Array<{ id: string; name: string; cnpj?: string | null; headquarters: boolean }>;
    contractedSystemKeys!: string[] | null;
    contractedSystemKeyOverrides!: Record<string, string[]> | null;
}
