import type { PaymentPeriod, PaymentPeriodCreateDto } from "@/modules/dp/payment/dto/payment.dto";
import { currentMonthReferenceDate, isoToMonthBr, normalizeMonthIso } from "@/shared/lib/input/date";

export function formatPaymentReference(referenceDate: string): string {
    return isoToMonthBr(referenceDate) || "-";
}

export function paymentPeriodToFormDto(entity: PaymentPeriod): PaymentPeriodCreateDto {
    return {
        referenceDate: normalizeMonthIso(entity.referenceDate ?? ""),
        notes: entity.notes,
    };
}

export const emptyPaymentPeriodForm = (): PaymentPeriodCreateDto => ({
    referenceDate: currentMonthReferenceDate(),
});
