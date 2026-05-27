import type { Company, CompanyCreateDto } from "@/modules/company/dto/company.dto";
import { BaseService } from "@/modules/root/services/base.service";

class CompanyService extends BaseService<Company, CompanyCreateDto, CompanyCreateDto> {
    constructor() {
        super("/api/v1/companies");
    }
}

export const companyService = new CompanyService();
