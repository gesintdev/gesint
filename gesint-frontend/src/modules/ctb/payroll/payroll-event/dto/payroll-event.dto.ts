export type PayrollEventType = "EARNING" | "DEDUCTION" | "INFORMATIVE";

export class PayrollEvent {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    eventCode!: string;
    description!: string;
    eventType!: PayrollEventType;
    incidesInss!: boolean;
    incidesFgts!: boolean;
    incidesIrrf!: boolean;
    formula?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayrollEventCreateDto {
    eventCode!: string;
    description!: string;
    eventType!: PayrollEventType;
    incidesInss?: boolean;
    incidesFgts?: boolean;
    incidesIrrf?: boolean;
    formula?: string;
}
