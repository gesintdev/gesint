import type { TaxObligation, TaxObligationCreateDto } from "@/modules/tax/dto/tax-obligation.dto";

export function taxObligationToFormDto(entity: TaxObligation): TaxObligationCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        obligationType: entity.obligationType,
        referenceCode: entity.referenceCode ?? "",
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        baseAmount: entity.baseAmount != null ? String(entity.baseAmount) : "",
        ratePercent: entity.ratePercent != null ? String(entity.ratePercent) : "",
        notes: entity.notes ?? "",
    };
}

export const emptyTaxObligationForm = (): TaxObligationCreateDto => ({
    collaboratorId: "",
    startDate: "",
    referenceCode: "",
    endDate: "",
    baseAmount: "",
    ratePercent: "",
    notes: "",
});
