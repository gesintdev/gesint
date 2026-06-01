export class Department {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    name!: string;
    costCenter!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class DepartmentCreateDto {
    name!: string;
    costCenter?: string;
}
