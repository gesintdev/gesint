export class ClientPayment {
    id!: string;
    code!: number;
    status!: string;
    clientId!: string;
    referenceCode?: string;
    amount!: number | string;
    dueDate!: string;
    paidAt?: string;
    paymentStatus!: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ClientPaymentCreateDto {
    clientId!: string;
    referenceCode?: string;
    amount!: string;
    dueDate!: string;
    paidAt?: string;
    paymentStatus!: string;
    notes?: string;
}
