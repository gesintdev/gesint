export type DismissalType = "WITHOUT_CAUSE" | "WITH_CAUSE" | "RESIGNATION" | "AGREEMENT" | "END_OF_CONTRACT" | "OTHER";

export class Offboarding {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    dismissalDate!: string;
    dismissalType!: DismissalType;
    dismissalNotes?: string;
    homologationNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class OffboardingCreateDto {
    collaboratorId!: string;
    dismissalDate!: string;
    dismissalType?: DismissalType;
    dismissalNotes?: string;
    homologationNotes?: string;
}
