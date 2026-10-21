export class ExitInterviewReturnChecklistConfig {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    itemKey!: string;
    description!: string;
    displayOrder!: number;
    createdAt?: string;
    updatedAt?: string;
}

export class ExitInterviewReturnChecklistConfigCreateDto {
    itemKey!: string;
    description!: string;
    displayOrder!: number;
}
