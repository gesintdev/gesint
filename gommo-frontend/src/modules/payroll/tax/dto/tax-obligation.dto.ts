export type TaxObligationType = "IRRF" | "INSS" | "FGTS" | "OTHER";

export class TaxObligation {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    obligationType!: TaxObligationType;
    referenceCode?: string;
    startDate!: string;
    endDate?: string;
    baseAmount?: string;
    ratePercent?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class TaxObligationCreateDto {
    collaboratorId!: string;
    obligationType?: TaxObligationType;
    referenceCode?: string;
    startDate!: string;
    endDate?: string;
    baseAmount?: string;
    ratePercent?: string;
    notes?: string;
}
