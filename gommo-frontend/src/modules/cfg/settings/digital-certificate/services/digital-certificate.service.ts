import type {
    DigitalCertificate,
    DigitalCertificateCreateDto,
} from "@/modules/cfg/settings/digital-certificate/dto/digital-certificate.dto";
import { BaseService } from "@/modules/root/services/base.service";

class DigitalCertificateService extends BaseService<
    DigitalCertificate,
    DigitalCertificateCreateDto,
    DigitalCertificateCreateDto
> {
    constructor() {
        super("/api/v1/digital-certificates");
    }
}

export const digitalCertificateService = new DigitalCertificateService();
