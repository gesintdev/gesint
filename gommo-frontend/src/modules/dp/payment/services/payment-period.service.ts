import type { PaymentPeriod, PaymentPeriodCreateDto } from "@/modules/dp/payment/dto/payment.dto";
import { BaseService } from "@/modules/root/services/base.service";

class PaymentPeriodService extends BaseService<PaymentPeriod, PaymentPeriodCreateDto, PaymentPeriodCreateDto> {
    constructor() {
        super("/api/v1/payment-periods");
    }
}

export const paymentPeriodService = new PaymentPeriodService();
