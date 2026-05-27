export class ClientUser {
    id!: string;
    status!: string;
    clientId!: string;
    clientName?: string;
    appUserId!: string;
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
    password!: string;
}
