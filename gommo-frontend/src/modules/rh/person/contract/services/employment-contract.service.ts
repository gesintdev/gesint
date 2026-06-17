import type {
    EmploymentContract,
    EmploymentContractCreateDto,
} from "@/modules/rh/person/contract/dto/employment-contract.dto";
import { BaseService } from "@/modules/root/services/base.service";
class EmploymentContractService extends BaseService<
    EmploymentContract,
    EmploymentContractCreateDto,
    EmploymentContractCreateDto
> {
    constructor() {
        super("/api/v1/contracts");
    }
}

export const employmentcontractService = new EmploymentContractService();
