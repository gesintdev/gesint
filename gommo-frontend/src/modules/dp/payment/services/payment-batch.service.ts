import type {
    PaymentBatch,
    PaymentBatchProcessResult,
    PaymentSlip,
    PaymentSlipSendResult,
    PaymentSlipStatus,
} from "@/modules/dp/payment/dto/payment.dto";
import { apiFetch, doRequest } from "@/shared/lib/api.client";

class PaymentBatchService {
    private readonly basePath = "/api/v1/payment-batches";

    getByPeriod(periodId: string): Promise<PaymentBatch[]> {
        return apiFetch<PaymentBatch[]>(`${this.basePath}/by-period/${periodId}`);
    }

    upload(periodId: string, file: File, description?: string): Promise<PaymentBatchProcessResult> {
        const formData = new FormData();
        formData.append("file", file);
        if (description?.trim()) {
            formData.append("description", description.trim());
        }
        return doRequest<PaymentBatchProcessResult>(`${this.basePath}/upload/${periodId}`, {
            method: "POST",
            body: formData,
        });
    }

    remove(batchId: string): Promise<void> {
        return apiFetch<void>(`${this.basePath}/${batchId}`, { method: "DELETE" });
    }

    getSlips(batchId: string, status?: PaymentSlipStatus): Promise<PaymentSlip[]> {
        const params = status ? `?status=${status}` : "";
        return apiFetch<PaymentSlip[]>(`${this.basePath}/${batchId}/slips${params}`);
    }

    sendAll(batchId: string): Promise<{ sentCount: number }> {
        return apiFetch<{ sentCount: number }>(`${this.basePath}/${batchId}/send-all`, { method: "POST" });
    }

    sendEmail(slipId: string): Promise<PaymentSlipSendResult> {
        return apiFetch<PaymentSlipSendResult>(`${this.basePath}/slips/${slipId}/send-email`, { method: "POST" });
    }

    sendWhatsapp(slipId: string): Promise<PaymentSlipSendResult> {
        return apiFetch<PaymentSlipSendResult>(`${this.basePath}/slips/${slipId}/send-whatsapp`, { method: "POST" });
    }

    validateSlip(slipId: string): Promise<PaymentSlip> {
        return apiFetch<PaymentSlip>(`${this.basePath}/slips/${slipId}/validate`, { method: "POST" });
    }
}

export const paymentBatchService = new PaymentBatchService();
