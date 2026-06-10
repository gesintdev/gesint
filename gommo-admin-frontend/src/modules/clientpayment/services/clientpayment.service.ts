import type { ClientPayment, ClientPaymentCreateDto } from "@/modules/clientpayment/dto/clientpayment.dto";
import { BaseService } from "@/modules/root/services/base.service";
class ClientPaymentService extends BaseService<ClientPayment, ClientPaymentCreateDto, ClientPaymentCreateDto> {
    constructor() {
        super("/api/v1/client-payments");
    }
}

export const clientPaymentService = new ClientPaymentService();
