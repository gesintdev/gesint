export class ProductSystem {
    id!: string;
    code!: number;
    status!: string;
    key!: string;
    name!: string;
    description?: string;
    defaultPrice?: number;
    withAiAvailable!: boolean;
    sortOrder?: number;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ProductSystemCreateDto {
    key!: string;
    name!: string;
    description?: string;
    defaultPrice?: number;
    withAiAvailable?: boolean;
    sortOrder?: number;
    notes?: string;
}
