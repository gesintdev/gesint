export class Department {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    sharedAcrossBranches?: boolean;
    companyId?: string | null;
    name!: string;
    costCenter?: string;
    description?: string;
    monthlyBudget?: number;
    location?: string;
    phone?: string;
    fax?: string;
    phoneExtension?: string;
    email?: string;
    responsibleCollaboratorIds?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export class DepartmentCreateDto {
    name!: string;
    companyId?: string | null;
    costCenter?: string;
    description?: string;
    monthlyBudget?: number | string;
    location?: string;
    phone?: string;
    fax?: string;
    phoneExtension?: string;
    email?: string;
    responsibleCollaboratorIds?: string[];
}
