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
    createdAt?: string;
    updatedAt?: string;
}

export class ClientUserCreateDto {
    clientId!: string;
    username!: string;
    email!: string;
    displayName?: string;
    password?: string;
}
