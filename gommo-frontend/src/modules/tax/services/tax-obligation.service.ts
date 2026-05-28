import type { TaxObligation, TaxObligationCreateDto } from "@/modules/tax/dto/tax-obligation.dto";
import { BaseService } from "@/modules/root/services/base.service";

class TaxObligationService extends BaseService<TaxObligation, TaxObligationCreateDto, TaxObligationCreateDto> {
    constructor() {
        super("/api/v1/tax-obligations");
    }
}

export const taxObligationService = new TaxObligationService();
