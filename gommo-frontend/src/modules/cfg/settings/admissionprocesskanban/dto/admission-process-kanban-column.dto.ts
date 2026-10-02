export class AdmissionProcessKanbanColumn {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    columnKey!: string;
    name!: string;
    color?: string | null;
    displayOrder!: number;
    systemColumn?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class AdmissionProcessKanbanColumnCreateDto {
    columnKey!: string;
    name!: string;
    color?: string | null;
    displayOrder!: number;
}
