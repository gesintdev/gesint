import type { Offboarding, OffboardingCreateDto } from "@/modules/offboarding/dto/offboarding.dto";
import { BaseService } from "@/modules/root/services/base.service";
class OffboardingService extends BaseService<Offboarding, OffboardingCreateDto, OffboardingCreateDto> {
    constructor() {
        super("/api/v1/offboardings");
    }
}

export const offboardingService = new OffboardingService();
