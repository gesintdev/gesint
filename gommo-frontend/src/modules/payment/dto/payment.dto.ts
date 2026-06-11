export type PaymentSlipStatus = "PROCESSED" | "DIVERGENT" | "NOT_FOUND" | "SENT";

export type PaymentBatchStatus = "PROCESSING" | "PROCESSED" | "PARTIALLY_SENT" | "SENT";

export class PaymentPeriod {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    referenceDate!: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PaymentPeriodCreateDto {
    referenceDate!: string;
    notes?: string;
}

export class PaymentBatch {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    paymentPeriodId!: string;
    batchType!: "SALARY";
    description?: string;
    sourceObjectId!: string;
    batchStatus!: PaymentBatchStatus;
    itemCount!: number;
    divergentCount!: number;
    sentCount!: number;
    processingPage?: number;
    totalPages?: number;
    processedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PaymentSlip {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    paymentBatchId!: string;
    collaboratorId?: string;
    collaboratorName?: string;
    collaboratorNameDisplay?: string;
    extractedName!: string;
    extractedNameDisplay?: string;
    slipObjectId?: string;
    slipStatus!: PaymentSlipStatus;
    pageNumber!: number;
    collaboratorEmail?: string;
    collaboratorPhone?: string;
    processedAt?: string;
    sentAt?: string;
    emailSentAt?: string;
    whatsappSentAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PaymentBatchProcessResult {
    batch!: PaymentBatch;
    processedCount!: number;
    divergentCount!: number;
}

export class PaymentSlipSendResult {
    slip!: PaymentSlip;
    whatsappUrl?: string;
}
