export class AdminUser {
    id!: string;
    code!: number;
    status!: string;
    username!: string;
    email!: string;
    fullName!: string;
    firstAccessCompleted?: boolean;
    accessToken?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class AdminUserCreateDto {
    username!: string;
    email!: string;
    fullName!: string;
}
