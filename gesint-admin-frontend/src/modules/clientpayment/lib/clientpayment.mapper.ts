import type { ClientPayment, ClientPaymentCreateDto } from "@/modules/clientpayment/dto/clientpayment.dto";

export function emptyClientPaymentForm(): ClientPaymentCreateDto {
    return {
        clientId: "",
        referenceCode: "",
        amount: "",
        dueDate: "",
        paidAt: "",
        paymentStatus: "PENDING",
        notes: "",
    };
}

export function clientPaymentToFormDto(item: ClientPayment): ClientPaymentCreateDto {
    return {
        clientId: item.clientId,
        referenceCode: item.referenceCode ?? "",
        amount: String(item.amount ?? ""),
        dueDate: item.dueDate?.slice(0, 10) ?? "",
        paidAt: item.paidAt?.slice(0, 10) ?? "",
        paymentStatus: item.paymentStatus,
        notes: item.notes ?? "",
    };
}
