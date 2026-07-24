export class ClientUser {
    id!: string;
    code!: number;
    status!: string;
    clientId!: string;
    clientName?: string;
    appUserId?: string | null;
    username?: string;
    email?: string;
    displayName?: string;
    firstAccessCompleted?: boolean;
    accessToken?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientUserCreateDto {
    clientId!: string;
    username!: string;
    email!: string;
    displayName?: string;
}
