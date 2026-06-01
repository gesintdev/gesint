export class Company {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    legalName!: string;
    tradeName!: string;
    cnpj!: string;
    email!: string;
    phone!: string;
    city!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class CompanyCreateDto {
    legalName!: string;
    tradeName?: string;
    cnpj!: string;
    email?: string;
    phone?: string;
    city?: string;
}
